# SmartSpend: Automated Bank Alert Personal Finance Dashboard

SmartSpend connects to your Gmail inbox, searches for bank alerts (debit/credit/UPI) from major banks (SBI, HDFC, ICICI, Axis, Kotak), parses transaction details using a robust regex engine, and organizes them in a premium, dark-mode-ready React dashboard.

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS v3 + React Query + Recharts
- **Backend**: Node.js + Express (ES Modules)
- **Database**: MongoDB (via Mongoose)
- **Authentication**: JWT & Google OAuth 2.0 (Google Identity Services)

## Directory Structure
- `backend/`: Node.js Express server containing DB models, routes, parsers, and controllers.
- `frontend/`: Vite React application containing UI pages, contexts, components, and charts.

## Prerequisites
- Node.js (v18+)
- MongoDB Atlas cluster URL
- Google Cloud Console Project (with Gmail API enabled and OAuth 2.0 Credentials)

## Installation & Setup

1. **Clone and Navigate**:
   ```bash
   cd SmartSpend
   ```

2. **Configure Backend**:
   - Navigate to `backend/` and install dependencies:
     ```bash
     cd backend
     npm install
     ```
   - Copy `.env.example` to `.env` and fill in your details:
     ```bash
     cp .env.example .env
     ```
   - *Ensure you configure the Google Client ID, Secret, and Redirect URIs correctly as described in the walkthrough.*

3. **Configure Frontend**:
   - Navigate to `frontend/` and install dependencies:
     ```bash
     cd ../frontend
     npm install
     ```

## Running the Application

In two separate terminals:

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend server runs on `http://localhost:5000`.

### Start Frontend Dev Server
```bash
cd frontend
npm run dev
```
The frontend dev server runs on `http://localhost:5173`. Open this URL in your web browser.

## Running Tests
To verify the parsing engines:
```bash
cd backend
npm run start # (Make sure dependencies are installed)
node src/parsers/testParsers.js
```
All parsing tests should output a successful status indicator.
