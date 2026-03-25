# Employee Management System (EMS)

A modern REST API for managing employees with CRUD operations, role-based access control, and JWT authentication.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#%EF%B8%8F-configuration)
- [Running the Application](#-running-the-application)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🔐 **JWT Authentication** - Secure token-based authentication
- 👥 **Role-Based Access Control** - Authorization with Admin and User roles
- ✏️ **CRUD Operations** - Complete Create, Read, Update, Delete operations for employee data
- 🗄️ **MySQL Database** - Reliable and scalable data storage
- 🔒 **Spring Security** - Enterprise-grade security features
- 📝 **RESTful API** - Industry-standard API design
- 🚀 **Spring Boot 3.2.0** - Latest Spring framework features

## 🛠 Tech Stack

### Backend
- **Java**: 17
- **Spring Boot**: 3.2.0
- **Spring Data JPA**: Database operations
- **Spring Security**: Authentication and authorization
- **JWT (jjwt)**: 0.11.5 - Token-based authentication
- **Lombok**: Boilerplate code reduction

### Database
- **MySQL**: Primary database
- **H2 Database**: For testing (optional)

### Build Tool
- **Maven**: Dependency management and build automation

## 📦 Prerequisites

You'll need the following to run this project:

- **Java Development Kit (JDK)**: 17 or higher
  ```bash
  java -version
  ```

- **Maven**: 3.6+ (or use the included Maven wrapper)
  ```bash
  mvn -version
  ```

- **MySQL**: 8.0+ 
  ```bash
  mysql --version
  ```

- **Git**: For version control
  ```bash
  git --version
  ```

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/090shreya04/Ecommerce.git
cd Ecommerce
```

### Step 2: Setup MySQL Database

1. Login to MySQL:
```bash
mysql -u root -p
```

2. Create the database:
```sql
CREATE DATABASE employee_management;
```

3. Create a user (optional):
```sql
CREATE USER 'emsuser'@'localhost' IDENTIFIED BY 'emspassword';
GRANT ALL PRIVILEGES ON employee_management.* TO 'emsuser'@'localhost';
FLUSH PRIVILEGES;
```

### Step 3: Configure Application Properties

Create or edit `src/main/resources/application.properties`:

```properties
# Server Configuration
server.port=8080

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/employee_management
spring.datasource.username=root
spring.datasource.password=yourpassword
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT Configuration
jwt.secret=yourSecretKeyForJWTTokenGenerationMustBeLongEnough
jwt.expiration=86400000
```

### Step 4: Install Dependencies

```bash
./mvnw clean install
```

Or if Maven is globally installed:

```bash
mvn clean install
```

## ⚙️ Configuration

### Environment Variables (Recommended for Production)

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=employee_management
export DB_USERNAME=root
export DB_PASSWORD=yourpassword
export JWT_SECRET=yourSecretKeyForJWT
export JWT_EXPIRATION=86400000
```

### Application Properties Template

```properties
# Server
server.port=${PORT:8080}

# Database
spring.datasource.url=jdbc:mysql://${DB_HOST:localhost}:${DB_PORT:3306}/${DB_NAME:employee_management}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:password}

# JWT
jwt.secret=${JWT_SECRET:defaultSecretKey}
jwt.expiration=${JWT_EXPIRATION:86400000}
```

## 🏃 Running the Application

### Run in Development Mode

```bash
./mvnw spring-boot:run
```

Or:

```bash
mvn spring-boot:run
```

### Run from JAR File

1. Build the JAR file:
```bash
./mvnw clean package
```

2. Run the JAR:
```bash
java -jar target/ems-0.0.1-SNAPSHOT.jar
```

The application will run on `http://localhost:8080`.

## 🌐 API Endpoints

### Authentication

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and get JWT token | Public |

**Register Request Body:**
```json
{
  "username": "admin",
  "password": "admin123",
  "email": "admin@example.com",
  "role": "ADMIN"
}
```

**Login Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "username": "admin",
  "role": "ADMIN"
}
```

### Employee Management

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/employees` | Get all employees | USER, ADMIN |
| GET | `/api/employees/{id}` | Get employee by ID | USER, ADMIN |
| POST | `/api/employees` | Create new employee | ADMIN |
| PUT | `/api/employees/{id}` | Update employee | ADMIN |
| DELETE | `/api/employees/{id}` | Delete employee | ADMIN |

**Employee Object:**
```json
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "department": "Engineering",
  "salary": 75000,
  "joiningDate": "2024-01-15"
}
```

### Authorization Header

For all protected endpoints:
```
Authorization: Bearer <your-jwt-token>
```

## 🚀 Deployment

### Option 1: Render.com (Free Hosting)

#### Step 1: Prepare GitHub Repository
- Push your code to GitHub
- Ensure `pom.xml` is in the root directory

#### Step 2: Setup MySQL Database (Railway or PlanetScale)

**Using Railway for MySQL:**
1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "Add MySQL"
3. Copy the connection details

**Using PlanetScale for MySQL:**
1. Sign up at [PlanetScale.com](https://planetscale.com)
2. Create a new database
3. Copy the connection string

#### Step 3: Deploy on Render

1. Sign up at [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the following settings:

**Build Settings:**
- **Build Command**: `./mvnw clean package -DskipTests`
- **Start Command**: `java -jar target/ems-0.0.1-SNAPSHOT.jar`

**Environment Variables:**
```
DB_HOST=<railway-mysql-host>
DB_PORT=3306
DB_NAME=railway
DB_USERNAME=<railway-username>
DB_PASSWORD=<railway-password>
JWT_SECRET=<your-secret-key>
JWT_EXPIRATION=86400000
PORT=8080
```

5. Click "Create Web Service"

#### Step 4: Update application.properties

```properties
spring.datasource.url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
server.port=${PORT:8080}
jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION}
```

### Option 2: Heroku

#### Step 1: Install Heroku CLI

```bash
# macOS
brew install heroku/brew/heroku

# Windows - Download from https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### Step 2: Login to Heroku

```bash
heroku login
```

#### Step 3: Create Application

```bash
heroku create your-app-name
```

#### Step 4: Add MySQL Addon

```bash
heroku addons:create jawsdb:kitefin
```

Or ClearDB:
```bash
heroku addons:create cleardb:ignite
```

#### Step 5: Set Environment Variables

```bash
heroku config:set JWT_SECRET=yourSecretKey
heroku config:set JWT_EXPIRATION=86400000
```

#### Step 6: Deploy

```bash
git push heroku main
```

#### Step 7: Open Application

```bash
heroku open
```

### Option 3: Docker

#### Create Dockerfile:

```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/ems-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### Build Docker Image:

```bash
./mvnw clean package
docker build -t employee-management-system .
```

#### Run Container:

```bash
docker run -p 8080:8080 \
  -e DB_HOST=your-db-host \
  -e DB_USERNAME=root \
  -e DB_PASSWORD=password \
  -e JWT_SECRET=secret \
  employee-management-system
```

#### Docker Compose (Optional)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: employee_management
      MYSQL_ROOT_PASSWORD: rootpassword
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql

  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      DB_HOST: mysql
      DB_PORT: 3306
      DB_NAME: employee_management
      DB_USERNAME: root
      DB_PASSWORD: rootpassword
      JWT_SECRET: mySecretKey
    depends_on:
      - mysql

volumes:
  mysql-data:
```

Run with:
```bash
docker-compose up
```

## 📱 Testing

### Using Postman

1. **Register User:**
   - Method: POST
   - URL: `http://localhost:8080/api/auth/register`
   - Body (JSON):
   ```json
   {
     "username": "admin",
     "password": "admin123",
     "email": "admin@example.com",
     "role": "ADMIN"
   }
   ```

2. **Login:**
   - Method: POST
   - URL: `http://localhost:8080/api/auth/login`
   - Body (JSON):
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```
   - Copy the token from the response

3. **Get All Employees:**
   - Method: GET
   - URL: `http://localhost:8080/api/employees`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer <your-token>`

4. **Create Employee:**
   - Method: POST
   - URL: `http://localhost:8080/api/employees`
   - Headers: `Authorization: Bearer <token>`
   - Body (JSON):
   ```json
   {
     "firstName": "John",
     "lastName": "Doe",
     "email": "john@example.com",
     "department": "IT",
     "salary": 75000
   }
   ```

### Using cURL

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","email":"admin@example.com","role":"ADMIN"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get Employees (replace YOUR_TOKEN_HERE)
curl -X GET http://localhost:8080/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🔧 Troubleshooting

### Common Issues and Solutions

**1. Database Connection Error:**
```
Solution: 
- Check if MySQL is running: sudo systemctl status mysql
- Verify database credentials
- Confirm database exists: SHOW DATABASES;
```

**2. Port Already in Use:**
```
Solution:
- Change port in application.properties: server.port=8081
- Or kill the running process: lsof -ti:8080 | xargs kill -9
```

**3. JWT Token Invalid:**
```
Solution:
- Token may be expired, login again
- Check JWT_SECRET environment variable
- Verify header format: "Authorization: Bearer <token>"
```

**4. Maven Build Failure:**
```
Solution:
- Check Java version: java -version (should be 17+)
- Clean and rebuild: ./mvnw clean install -U
- Check internet connection for dependency downloads
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

## 👨‍💻 Developer

**Shreya** - [@090shreya04](https://github.com/090shreya04)

## 📞 Contact

For any questions or support:
- GitHub Issues: [Create an Issue](https://github.com/090shreya04/Ecommerce/issues)
- Email: [1469.shreya@gmail.com]

## 🙏 Acknowledgments

- Spring Boot Documentation
- JWT.io
- MySQL Documentation
- Spring Security Reference

---

⭐ If you find this project useful, please give it a star!
