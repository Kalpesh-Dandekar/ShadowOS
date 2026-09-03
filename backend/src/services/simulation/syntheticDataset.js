const freezeRows = (rows) => Object.freeze(rows.map((row) => Object.freeze(row)));

export const SYNTHETIC_REFERENCE_DATE = "2026-01-01";

export const syntheticDataset = Object.freeze({
  INVOICE: freezeRows([
    { id: "INV-SIM-001", status: "archived", createdAt: "2023-05-14", category: "services", dependencyCount: 2 },
    { id: "INV-SIM-002", status: "archived", createdAt: "2023-11-03", category: "software", dependencyCount: 0 },
    { id: "INV-SIM-003", status: "active", createdAt: "2023-07-10", category: "services", dependencyCount: 1 },
    { id: "INV-SIM-004", status: "archived", createdAt: "2024-04-12", category: "hardware", dependencyCount: 0 },
    { id: "INV-SIM-005", status: "archived", createdAt: "2022-09-21", category: "operations", dependencyCount: 1 },
  ]),
  CUSTOMER_ACCOUNT: freezeRows([
    { id: "ACC-SIM-001", status: "inactive", inactiveSince: "2022-02-10", archived: false, dependencyCount: 2 },
    { id: "ACC-SIM-002", status: "inactive", inactiveSince: "2023-06-18", archived: false, dependencyCount: 0 },
    { id: "ACC-SIM-003", status: "inactive", inactiveSince: "2025-03-08", archived: false, dependencyCount: 1 },
    { id: "ACC-SIM-004", status: "active", inactiveSince: null, archived: false, dependencyCount: 0 },
    { id: "ACC-SIM-005", status: "inactive", inactiveSince: "2021-08-30", archived: true, dependencyCount: 1 },
  ]),
});
