package com.dtechideas.restapitesting.model;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
@Table(name = "employees", uniqueConstraints = {@UniqueConstraint(columnNames = {"email"})})
public class Employee {
	private Long id;
	private String firstName;
	private String lastName;
	private String email;
	public Long getId() { /* ... */ }
	}
	public void setId(Long id) { /* ... */ }
	}
	public String getFirstName() { /* ... */ }
	}
	public void setFirstName(String firstName) { /* ... */ }
	}
	public String getLastName() { /* ... */ }
	}
	public void setLastName(String lastName) { /* ... */ }
	}
	public String getEmail() { /* ... */ }
	}
	public void setEmail(String email) { /* ... */ }
	}
	public Employee(Long id, String firstName, String lastName, String email) { /* ... */ }
	}
	public Employee(String firstName, String lastName, String email) { /* ... */ }
	}
	public Employee() { /* ... */ }
	}
}