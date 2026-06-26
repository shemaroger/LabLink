package com.techquest.lablink.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
@AllArgsConstructor
public class AuditStatsResponse {

    private final long totalLogs;
    private final long logsToday;
    private final long logsLast7Days;
    private final long logsLast30Days;
    private final List<Map<String, Object>> topActions;
    private final List<Map<String, Object>> topUsers;
}
