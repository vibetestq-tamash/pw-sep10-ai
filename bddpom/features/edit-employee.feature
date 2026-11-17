@regression @employee
Feature: Edit employee

Background:
  Given I navigate to hrm login page
  When I enter valid username as "testadmin" and password as "Vibetestq@123#"
  And I click on the login button
  Then I should be redirected to the dashboard page

Scenario: Edit the name of an existing employee
  Given I open the Add Employee page
  And I add an employee with first name "Jane" and last name "Doe"
  When I change the middle name to "Quinn" and save
  Then I should see the message "Successfully Updated"
  And the middle name should be "Quinn"
