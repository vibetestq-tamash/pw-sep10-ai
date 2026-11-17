@smoke @employee
Feature: Add employee

Background:
  Given I navigate to hrm login page
  When I enter valid username as "testadmin" and password as "Vibetestq@123#"
  And I click on the login button
  Then I should be redirected to the dashboard page

Scenario: Add a new employee
  When I open the Add Employee page
  And I enter employee id "A{{run}}"
  And I add an employee with first name "John" and last name "Smith-{{run}}"
  Then I should see the personal details of "John" "Smith-{{run}}"
