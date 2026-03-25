package com.example.ems.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardStatsDto {
    private long totalEmployees;
    private long totalDepartments;
    private double avgSalary;
    private String newestHireDate; // ISO "YYYY-MM-DD" or null
}
