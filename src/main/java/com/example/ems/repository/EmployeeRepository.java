package com.example.ems.repository;

import com.example.ems.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;

public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    @Query("SELECT COUNT(DISTINCT e.department) FROM Employee e WHERE e.department IS NOT NULL")
    long countDistinctDepartments();

    @Query("SELECT COALESCE(AVG(e.salary), 0) FROM Employee e")
    double findAvgSalary();

    @Query("SELECT MAX(e.hireDate) FROM Employee e")
    LocalDate findNewestHireDate();
}
