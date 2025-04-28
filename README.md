
# AssemBLY

## How to Run 🏃‍♂️

### Backend (Spring Boot)

1. Erstelle die Datei `src/main/resources/application.properties`

   ```properties
   server.port=5000
   spring.datasource.url=jdbc:mysql://localhost:3306/versammlungsassistent
   spring.datasource.username=root
   spring.datasource.password=
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   mailjet.api.public=DEIN_PUBLIC_KEY
   mailjet.api.private=DEIN_PRIVATE_KEY
   jwt.secret=DEIN_SECRET
   ```

2. Installiere die Abhängigkeiten:

   ```bash
   mvn clean install
   ```

3. Starte das Backend:
   - In IntelliJ: Rechtsklick auf `Application.java` → **Run**

---

### Frontend (React)

1. Wechsle ins Frontend-Verzeichnis:

   ```bash
   cd frontend
   ```

2. Erstelle die Datei `frontend/.env`

   ```env
   REACT_APP_BACKEND_URL=http://localhost:5000
   ```

3. Installiere die Abhängigkeiten:

   ```bash
   npm install
   ```

4. Starte das Frontend:

   ```bash
   npm start
   ```

---

## Voraussetzungen

- **MySQL** (mit einer Datenbank `versammlungsassistent`)
- **Node.js** und **npm**
- **Maven**
- **Java 17+**
- **IntelliJ IDEA** (oder eine andere Java IDE)


**Hinweis:**  
Vergiss nicht, deine Mailjet API Keys und das JWT Secret korrekt einzutragen!


