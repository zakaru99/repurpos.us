// Home page figures, chart data and release notes. Update on each data release.
//
// phases: placeholder until real counts are filled in - replace with the number of
// compounds per highest_phase in the reframe ES index, then set placeholder to false.
// assayFormats / moaCategories / ontologies were computed from /api/assay_list and
// ontology-tree/phase2b_moa_updated.json on 2026-10-13.
export const HOME_DATA = {
  "stats": {
    "totalCompounds": 13831,
    "newCompounds": 159,
    "pediatricCompounds": 482,
    "pkCompounds": 3761,
    "publishedScreens": 222,
    "lastUpdated": "2026/07/31"
  },
  "phases": {
    "placeholder": true,
    "_note": "Replace with counts of compounds by highest_phase from the reframe ES index, then set placeholder to false.",
    "items": [
      {
        "label": "Launched",
        "value": 4800
      },
      {
        "label": "Phase III",
        "value": 1500
      },
      {
        "label": "Phase II",
        "value": 3100
      },
      {
        "label": "Phase I",
        "value": 2300
      },
      {
        "label": "Preclinical",
        "value": 1500
      },
      {
        "label": "Other / unknown",
        "value": 631
      }
    ]
  },
  "assayFormats": [
    {
      "label": "Cell-based",
      "value": 109
    },
    {
      "label": "Biochemical / enzymatic",
      "value": 63
    },
    {
      "label": "Cell-based, high-content imaging",
      "value": 25
    },
    {
      "label": "Cell-based, viability",
      "value": 12
    },
    {
      "label": "Not recorded",
      "value": 13
    }
  ],
  "ontologies": [
    {
      "label": "Pharmacological role",
      "value": 1250
    },
    {
      "label": "Biological role",
      "value": 1122
    },
    {
      "label": "Chemical role",
      "value": 6
    },
    {
      "label": "Target Interaction Type",
      "value": 2248
    },
    {
      "label": "Target",
      "value": 2257
    }
  ],
  "moaCategories": [
    {
      "label": "Anti-Infective Agent",
      "value": 827
    },
    {
      "label": "Antineoplastic Agent",
      "value": 223
    },
    {
      "label": "Agent Affecting Nervous System",
      "value": 112
    },
    {
      "label": "Immunotherapeutic Agent",
      "value": 58
    },
    {
      "label": "Agent Affecting Blood or Body Fluid",
      "value": 40
    },
    {
      "label": "Anti-Inflammatory Agent",
      "value": 25
    },
    {
      "label": "Hormone Therapy Agent",
      "value": 13
    },
    {
      "label": "Agent Affecting Respiratory System",
      "value": 8
    }
  ],
  "whatsNew": [
    [
      "2026/06/17",
      "Mobile optimizations across the site"
    ],
    [
      "2026/06/17",
      "Save compounds to favorites and custom lists"
    ],
    [
      "2026/06/17",
      "New My Account, My Favorites, and My Lists pages"
    ],
    [
      "2026/03/02",
      "Assay description page sortable by status"
    ],
    [
      "2026/03/02",
      "All assay descriptions in the workflow loaded"
    ],
    [
      "2026/1/28",
      "Added user dashboard"
    ],
    [
      "2026/1/25",
      "Added built in assay proposal form"
    ],
    [
      "2025/12/02",
      "Modernized workflow & about UI"
    ],
    [
      "2025/12/01",
      "Modernized ontology tree UI"
    ],
    [
      "2025/11/25",
      "Added \"contact us\" feature"
    ],
    [
      "2025/11/19",
      "Modernized homepage UI"
    ],
    [
      "2025/11/05",
      "New predictive searching"
    ],
    [
      "2025/10/04",
      "Assay toxicity tag"
    ]
  ]
};
