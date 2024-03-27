from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import os
import time
import random
import string
from concurrent.futures import ThreadPoolExecutor

# Function to generate a random string
def generate_random_string(length=8):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for i in range(length))

# Function to register a user
def register_user(driver, username, email, password, avatar_path):
    time.sleep(2)
    driver.find_element(By.XPATH, "/html/body/div[1]/div/div/div/p/a").click()
    time.sleep(1)  # Wait for the registration page to load

    # Fill in registration form
    username_field = driver.find_element("name", "username")
    email_field = driver.find_element("name", "email")
    password_field = driver.find_element("name", "password")
    file_input = driver.find_element("name", "file")

    username_field.send_keys(username)
    email_field.send_keys(email)
    password_field.send_keys(password)

    # Upload avatar
    file_input.send_keys(avatar_path)

    # Submit registration form
    submit_button = driver.find_element(By.XPATH, "/html/body/div[1]/div/div/form/button")
    submit_button.click()

    # Wait for the alert
    try:
        WebDriverWait(driver, 10).until(EC.alert_is_present())
        alert = driver.switch_to.alert
        alert.accept()
    except TimeoutException:
        print("No alert found after registration.")

# Function to create unique usernames and emails
def generate_unique_data(base_username, base_email, index):
    username = base_username + str(index)
    email = base_email + str(index) + "@example.com"
    return username, email

# Function to register users
def register_users(base_username, base_email, password, avatar_path, start_index, end_index):
    # Configure Chrome options for incognito mode and disabling cache
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--incognito")
    chrome_options.add_argument("--disable-cache")

    # Create a new WebDriver instance
    driver = webdriver.Chrome(options=chrome_options)
    try:
        # Open the app URL
        driver.get("https://www.decipher.website")

        # Register users
        for i in range(start_index, end_index):
            username, email = generate_unique_data(base_username, base_email, i)
            register_user(driver, username, email, password, avatar_path)
            time.sleep(3)  # Add delay to allow registration process
            print("Registered")

    finally:
        # Close the WebDriver
        driver.quit()

# Main function
def main():
    # Generate random strings
    random_string = generate_random_string()

    # Base data for registration
    base_username = "user" + random_string
    base_email = "user" + random_string
    password = "password" + random_string
    avatar_path = os.path.abspath("3.png")

    # Total number of users to register
    total_users = 100
    # Number of concurrent registrations
    concurrent_registrations = 20

    # Calculate the number of batches required
    num_batches = total_users // concurrent_registrations

    # Create a ThreadPoolExecutor
    with ThreadPoolExecutor(max_workers=num_batches) as executor:
        # Submit tasks for registration
        for i in range(num_batches):
            start_index = i * concurrent_registrations + 1
            end_index = min((i + 1) * concurrent_registrations + 1, total_users + 1)
            executor.submit(register_users, base_username, base_email, password, avatar_path, start_index, end_index)

if __name__ == "__main__":
    main()
