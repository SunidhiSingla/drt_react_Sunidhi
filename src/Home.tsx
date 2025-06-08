import React, { useMemo, useState, useEffect, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  type SelectionChangedEvent,
} from "ag-grid-community";
import OutlinedInput from "@mui/material/OutlinedInput";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { openDB } from "idb";
import type { IDBPDatabase } from "idb";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

ModuleRegistry.registerModules([AllCommunityModule]);
interface SatelliteData {
  noradCatId: string;
  name: string;
  launchDate: string;
  objectType: string;
  countryCode: string;
  orbitCode: string;
}
interface MyDB {
  satellites: {
    key: string;
    value: SatelliteData[];
  };
}

let db: IDBPDatabase<MyDB>;

const initDB = async () => {
  db = await openDB<MyDB>("satelliteDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("satellites")) {
        db.createObjectStore("satellites");
      }
    },
  });
};
const saveSatellites = async (data: SatelliteData[]): Promise<void> => {
  if (!db) await initDB();
  await db.put("satellites", data, "latest");
};

const getSatellites = async (): Promise<SatelliteData[] | undefined> => {
  if (!db) await initDB();
  return await db.get("satellites", "latest");
};
const ORBIT_CODES = [
  "LEO",
  "LEO1",
  "LEO2",
  "LEO3",
  "LEO4",
  "MEO",
  "GEO",
  "HEO",
  "IGO",
  "EGO",
  "NSO",
  "GTO",
  "GHO",
  "HAO",
  "MGO",
  "LMO",
  "UFO",
  "ESO",
  "UNKNOWN",
];

const Home: React.FC = () => {
  const [allData, setAllData] = useState<SatelliteData[]>();
  const [filteredData, setFilteredData] = useState<SatelliteData[]>();
  const [selectedObjectTypes, setSelectedObjectTypes] = useState<string[]>([]);
  const [selectedOrbitCodes, setSelectedOrbitCodes] = useState<string[]>([]);
  const [nameSearch, setNameSearch] = useState("");
  const [noradSearch, setNoradSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<unknown[]>([]);
  const MAX_SELECTION = 10;
  const navigate = useNavigate();

  const handleProceed = () => {
    if (selectedRows.length === 0) {
      alert("Please select at least one object.");
      return;
    }
    localStorage.setItem("selectedSatellites", JSON.stringify(selectedRows));
    navigate("/selected");
  };

  const applyAllFilters = () => {
    let filtered = [...(allData ?? [])];

    if (nameSearch.trim()) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(nameSearch.toLowerCase())
      );
    }

    if (noradSearch.trim()) {
      filtered = filtered.filter((item) =>
        item.noradCatId.toLowerCase().includes(noradSearch.toLowerCase())
      );
    }

    if (selectedObjectTypes.length > 0) {
      filtered = filtered.filter((item) =>
        selectedObjectTypes.includes(item.objectType)
      );
    }

    if (selectedOrbitCodes.length > 0) {
      filtered = filtered.filter((item) =>
        selectedOrbitCodes.includes(item.orbitCode.replace(/[{}]/g, ""))
      );
    }

    setFilteredData(filtered);
  };
  const gridRef = useRef<AgGridReact<SatelliteData>>(null);
  useEffect(() => {
    const fetchData = async () => {
      const cached = await getSatellites();
      if (cached) {
        setAllData(cached);
        setFilteredData(cached);
      } else {
        try {
          const res = await fetch(
            "https://backend.digantara.dev/v1/satellites?attributes=name%2CnoradCatId%2ClaunchDate%2CcountryCode%2CorbitCode%2CobjectType"
          );
          const json = await res.json();
          const cleaned = json.data.map((item: SatelliteData) => ({
            ...item,
            orbitCode: item.orbitCode?.replace(/[{}]/g, ""),
          }));
          setAllData(cleaned);
          setFilteredData(cleaned);
          await saveSatellites(cleaned);
        } catch (error) {
          console.error("Failed to fetch satellite data", error);
        }
      }
    };
    fetchData();
  }, []);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "Name",
        field: "name",
        sortable: true,
        flex: 1,
        headerCheckboxSelection: true,
        checkboxSelection: true,
      },
      {
        headerName: "NORAD Cat ID",
        field: "noradCatId",
        sortable: true,
        flex: 1,
      },
      {
        headerName: "Orbit Code",
        field: "orbitCode",
        flex: 1,
      },
      {
        headerName: "Object Type",
        field: "objectType",
        flex: 1,
      },
      {
        headerName: "Country Code",
        field: "countryCode",
        sortable: true,
        flex: 1,
      },
      {
        headerName: "Launch Date",
        field: "launchDate",
        sortable: true,
        flex: 1,
        valueFormatter: (params: { value: string }) => {
          if (params.value) {
            return new Date(params.value).toLocaleDateString();
          }
          return "";
        },
      },
    ],
    []
  );

  const uniqueObjectTypes = useMemo(() => {
    return Array.from(new Set(allData?.map((d) => d.objectType))).sort();
  }, [allData]);

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
    }),
    []
  );
  const handleTypeChange = (
    event: SelectChangeEvent<typeof selectedObjectTypes>
  ) => {
    const {
      target: { value },
    } = event;
    setSelectedObjectTypes(
      typeof value === "string" ? value.split(",") : value
    );
  };
  const handleCodeChange = (
    event: SelectChangeEvent<typeof selectedObjectTypes>
  ) => {
    const {
      target: { value },
    } = event;
    setSelectedOrbitCodes(typeof value === "string" ? value.split(",") : value);
  };
  const onSelectionChanged = (event: SelectionChangedEvent) => {
    const selected = event.api.getSelectedRows();
    if (selected.length > MAX_SELECTION) {
      const nodes = event.api.getSelectedNodes();
      const lastSelectedNode = nodes.find(
        (node) => !selectedRows.includes(node.data)
      );

      if (lastSelectedNode) {
        lastSelectedNode.setSelected(false);
      }
      alert(`You can only select up to ${MAX_SELECTION} rows.`);
      return;
    }

    setSelectedRows(selected);
  };

  return (
    <div className="w-full h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Satellite Data</h1>
      <div className="flex flex-wrap gap-4">
        <div>
          <FormControl sx={{ width: 300 }}>
            <InputLabel id="multiple-type-label">Object Type</InputLabel>
            <Select
              id="multiple-type"
              multiple
              value={selectedObjectTypes}
              onChange={handleTypeChange}
              input={<OutlinedInput label="Object Type" />}
              MenuProps={MenuProps}
            >
              {uniqueObjectTypes.map((name) => (
                <MenuItem key={name} value={name}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>
        <div>
          <FormControl sx={{ width: 300 }}>
            <InputLabel id="multiple-code-label">Object Code</InputLabel>
            <Select
              id="multiple-code"
              multiple
              value={selectedOrbitCodes}
              onChange={handleCodeChange}
              input={<OutlinedInput label="Object Type" />}
              MenuProps={MenuProps}
            >
              {ORBIT_CODES.map((code) => (
                <MenuItem key={code} value={code}>
                  {code}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

        <div className="flex items-end">
          <button
            onClick={applyAllFilters}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 mb-4 mt-4">
        <TextField
          placeholder="Search by name"
          className="border rounded w-[300px]"
          value={nameSearch}
          onChange={(e) => setNameSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyAllFilters()}
        />

        <TextField
          placeholder="Search by NORAD ID"
          className="border rounded w-[300px]"
          value={noradSearch}
          onChange={(e) => setNoradSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyAllFilters()}
        />
      </div>

      <div className="h-96">
        <div className="flex items-end">
          <p className="text-sm text-gray-600">
            {filteredData?.length} result(s)
          </p>
        </div>
        <AgGridReact
          ref={gridRef}
          rowData={filteredData}
          columnDefs={columnDefs}
          rowBuffer={5} 
          defaultColDef={defaultColDef}
          onSelectionChanged={onSelectionChanged}
          rowSelection="multiple"
          domLayout="normal"
        />
      </div>
      <div className="text-gray-700 font-medium mt-4">
        Selected Rows: {selectedRows.length}
      </div>
      <button
        onClick={handleProceed}
        className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        Proceed
      </button>
    </div>
  );
};

export default Home;
