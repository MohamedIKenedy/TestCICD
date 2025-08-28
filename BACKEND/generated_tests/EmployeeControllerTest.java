package com.dtechideas.restapitesting.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.dtechideas.restapitesting.model.Employee;
import com.dtechideas.restapitesting.service.EmployeeService;

class EmployeeControllerTest {
	@Mock
	private EmployeeService employeeService;

	@InjectMocks
	private EmployeeController employeeController;

	@BeforeEach
	void setUp() throws Exception {
		MockitoAnnotations.initMocks(this);
	}

	@Test
	void testCreateEmployee() {
		// Given
		final String firstName = "John";
		final String lastName = "Doe";
		final Employee employee = new Employee();
		employee.setFirstName(firstName);
		employee.setLastName(lastName);
		when(this.employeeService.saveEmployee(any())).thenReturn(employee);

		// When
		ResponseEntity<Employee> response = this.employeeController.createEmployee(employee);

		// Then
		assertEquals(HttpStatus.CREATED, response.getStatusCode());
		verify(this.employeeService).saveEmployee(any());
	}

	@Test
	void testGetAllEmployees() {
		// Given
		final List<Employee> employees = new ArrayList<>();
		when(this.employeeService.getAllEmployees()).thenReturn(employees);

		// When
		ResponseEntity<List<Employee>> response = this.employeeController.getAllEmployees();

		// Then
		assertEquals(HttpStatus.OK, response.getStatusCode());
		verify(this.employeeService).getAllEmployees();
	}

	@Test
	void testGetEmployeeById() {
		// Given
		final Long employeeId = 1L;
		when(this.employeeService.findById(any())).thenReturn(new Employee());

		// When
		ResponseEntity<Employee> response = this.employeeController.getEmployeeById(employeeId);

		// Then
		assertEquals(HttpStatus.OK, response.getStatusCode());
		verify(this.employeeService).findById(any());
	}

	@Test
	void testUpdateEmployee() {
		// Given
		final Long employeeId = 1L;
		when(this.employeeService.updateEmployee(any(), any())).thenReturn(new Employee());

		// When
		ResponseEntity<Employee> response = this.employeeController.updateEmployee(employeeId, new Employee());

		// Then
		assertEquals(HttpStatus.OK, response.getStatusCode());
		verify(this.employeeService).updateEmployee(any(), any());
	}

	@Test
	void testDeleteEmployeeById() {
		// Given
		final Long employeeId = 1L;
		when(this.employeeService.deleteEmployeeById(any())).thenReturn(new Employee());

		// When
		ResponseEntity<Employee> response = this.employeeController.deleteEmployeeById(employeeId);

		// Then
		assertEquals(HttpStatus.OK, response.getStatusCode());
		verify(this.employeeService).deleteEmployeeById(any());
	}
}