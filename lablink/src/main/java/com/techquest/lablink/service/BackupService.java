package com.techquest.lablink.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BackupService {

    private final String jdbcUrl;
    private final String username;
    private final String password;
    private final String pgDumpCommand;
    private final Path backupDir;

    public BackupService(@Value("${spring.datasource.url}") String jdbcUrl,
                          @Value("${spring.datasource.username}") String username,
                          @Value("${spring.datasource.password}") String password,
                          @Value("${app.backup.pg-dump-path:pg_dump}") String pgDumpCommand) {
        this.jdbcUrl = jdbcUrl;
        this.username = username;
        this.password = password;
        this.pgDumpCommand = pgDumpCommand;
        this.backupDir = Paths.get(System.getProperty("java.io.tmpdir"), "lablink-backups");
    }

    public Resource createBackup() {
        try {
            Files.createDirectories(backupDir);

            URI uri = URI.create(jdbcUrl.substring("jdbc:".length()));
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String dbName = uri.getPath().substring(1);

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            Path outputFile = backupDir.resolve("lablink-backup-" + timestamp + ".sql");

            ProcessBuilder processBuilder = new ProcessBuilder(
                    pgDumpCommand, "-h", host, "-p", String.valueOf(port),
                    "-U", username, "-d", dbName, "-F", "p", "-f", outputFile.toString());
            processBuilder.environment().put("PGPASSWORD", password);
            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();
            String output;
            try (var reader = process.inputReader()) {
                output = reader.lines().collect(Collectors.joining("\n"));
            }
            boolean finished = process.waitFor(60, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                throw new RuntimeException("Database backup timed out.");
            }
            if (process.exitValue() != 0) {
                log.error("pg_dump failed: {}", output);
                throw new RuntimeException("Database backup failed: " + output);
            }

            return new UrlResource(outputFile.toUri());
        } catch (IOException e) {
            throw new RuntimeException("Failed to create database backup.", e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Database backup was interrupted.", e);
        }
    }
}
