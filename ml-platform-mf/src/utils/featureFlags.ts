export const featureFlags = {
  FEATURE_STORE: {
    LIST_PAGE: {
      USAGE: false
    },
    DETAILS_PAGE: {
      LAST_UPDATED_AT: true,
      USAGE: false
    }
  },
  WORKFLOWS: {
    LIST_PAGE: {
      CREATE: true
    },
    DETAILS_PAGE: {
      EDIT: true,
      EDIT_SCHEDULE: true
    }
  },
  COMPUTE: {
    LIST_PAGE: {
      RECENTLY_VISITED_CLUSTERS: true,
      CLUSTER_LISTING_TABLE: {
        COST: false
      }
    }
  },
  SETTINGS: true
}
