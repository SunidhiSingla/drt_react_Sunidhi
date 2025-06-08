# 🛰️ Satellite Tracker Dashboard

A React + TypeScript application for visualizing large satellite datasets using AG Grid with powerful features like:

- Multi-select filters
- Search (partial match on name & NORAD ID)
- Sorting - For Sorting click on the title of column.
     Upward arrow means ascending order ![image](https://github.com/user-attachments/assets/3a302f29-e332-4684-ae39-b21e086a0bd7)
     Downward arrow means descending order ![image](https://github.com/user-attachments/assets/50368eb3-171c-4ecf-83c4-c285e43d6bbb)
- IndexDB caching to improve performance
- Row selection (max 10) with Proceed screen - Selected row data persists on page refresh
- Fully responsive UI

---

## 🛠 Tech Stack

- ⚛️ React (with TypeScript)
- 🎨 Tailwind CSS
- 📊 AG Grid (community version) -  The grid uses DOM virtualisation to vastly improve rendering performance. A row buffer of 5 has been added for smooth scrolling.
- 🧠 IndexedDB via `idb` package - On first load: App fetches data from the API Saves it to indexedDB. On future visits: Instead of hitting the API again, it reads from the local indexedDB.This speeds up load                                         time and reduces API calls
- 🔍 MUI components (`@mui/material`)

---
![image](https://github.com/user-attachments/assets/a3aedff9-7812-4191-b1da-5ab359ab8b34)
![image](https://github.com/user-attachments/assets/b7077ede-8ed1-4e8c-80d6-df67523165ce)
![image](https://github.com/user-attachments/assets/6d34e89e-ec95-42ec-ad01-84cc2f286ad0)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/SunidhiSingla/drt_react_Sunidhi.git
cd satellite-dashboard
npm install
npm run dev
