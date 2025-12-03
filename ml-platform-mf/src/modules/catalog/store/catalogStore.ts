import {create} from 'zustand'
import {LOADER_NAME} from '../../../components/dataCatalog/constant'
import {API_STATUS} from '../../../utils/apiUtils'
import {gqlRequestTyped} from '../../../utils/gqlRequestTyped'
import {
  GetCatalogAssetsInput,
  SelectionOnAssets,
  SelectionOnGetCatalogAssets
} from '../graphqlApis/getCatalogAssets/index'
import {GQL as catalogAssetsGql} from '../graphqlApis/getCatalogAssets/indexGql'
import {
  SearchAssetsInput,
  SelectionOnData,
  SelectionOnSearchAssets
} from '../graphqlApis/searchAssets/index'
import {GQL as searchAssetsGql} from '../graphqlApis/searchAssets/indexGql'

interface SearchAssetEntry {
  status: API_STATUS
  data: SelectionOnSearchAssets | null
  error: any
}

interface QuerySearchAssetStore {
  status: API_STATUS
  data: SelectionOnSearchAssets | null
  error: any
}

interface CatalogState {
  searchAssets: Record<string, SearchAssetEntry>
  searchAssetsAction: (
    key: string,
    payload: SearchAssetsInput,
    merge?: boolean
  ) => Promise<void>
  resetSearchAssets: () => void
  querySearchAssets: (
    payload: SearchAssetsInput,
    prevData: SelectionOnSearchAssets | null
  ) => Promise<void>
  querySearchAssetsData: QuerySearchAssetStore
  resetQuerySearchAssets: () => void
  expandedItems: string[]
  setExpandedItems: (items: string[]) => void
  addExpandedItem: (item: string) => void
  removeExpandedItem: (item: string) => void
  resetExpandedItems: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  resetSearchQuery: () => void
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  searchQuery: '',
  setSearchQuery: (query: string) => {
    set((state) => ({
      searchQuery: query
    }))
  },
  resetSearchQuery: () => {
    set((state) => ({
      searchQuery: ''
    }))
  },
  expandedItems: [],
  setExpandedItems: (items: string[]) => {
    set((state) => ({
      expandedItems: items
    }))
  },
  addExpandedItem: (item: string) => {
    set((state) => ({
      expandedItems: [...state.expandedItems.filter((i) => i !== item), item]
    }))
  },
  removeExpandedItem: (item: string) => {
    set((state) => ({
      expandedItems: state.expandedItems.filter((i) => i !== item)
    }))
  },
  resetExpandedItems: () => {
    set((state) => ({
      expandedItems: []
    }))
  },
  searchAssets: {},
  querySearchAssetsData: {
    status: API_STATUS.INIT,
    data: null,
    error: null
  },
  searchAssetsAction: async (key, payload) => {
    const current = get().searchAssets[key]
    const searchAssetData = {
      ...current?.data,
      data: [
        ...(current?.data?.data || []),
        {
          asset_name: '-1',
          depth: payload.depth,
          asset_prefix: '-1',
          is_terminal: true
        }
      ]
    }

    set((state) => ({
      searchAssets: {
        ...state.searchAssets,
        [key]: {
          ...current,
          data: searchAssetData,
          status: API_STATUS.LOADING,
          error: null
        }
      }
    }))

    try {
      const gql = {
        ...searchAssetsGql,
        variables: payload
      }

      const response = await gqlRequestTyped<
        SearchAssetsInput,
        {searchAssets: SelectionOnSearchAssets}
      >(gql)

      if (response.data) {
        const newData = response.data.searchAssets
        const prevData = {
          ...current?.data,
          data: current?.data?.data?.filter(
            (d) => d?.asset_name !== LOADER_NAME
          )
        }

        let combinedData: SelectionOnSearchAssets | null = newData

        // Merge if previous data exists (i.e., pagination case)
        if (prevData && newData) {
          combinedData = {
            ...newData,
            data: [...(prevData.data || []), ...(newData.data || [])]
          }
        }

        set((state) => ({
          searchAssets: {
            ...state.searchAssets,
            [key]: {
              status: API_STATUS.SUCCESS,
              data: combinedData,
              error: null
            }
          }
        }))
      }
    } catch (error) {
      set((state) => ({
        searchAssets: {
          ...state.searchAssets,
          [key]: {
            status: API_STATUS.ERROR,
            data: current?.data || null,
            error
          }
        }
      }))
    }
  },
  resetSearchAssets: () => {
    set((state) => ({
      searchAssets: {},
      expandedItems: []
    }))
  },
  querySearchAssets: async (payload, prevData) => {
    const current = get().querySearchAssetsData
    // Determine if this is pagination based on whether prevData is provided
    const isPagination = prevData !== null

    set((state) => ({
      querySearchAssetsData: {
        status: API_STATUS.LOADING,
        error: null,
        data: isPagination ? state.querySearchAssetsData.data : null
      }
    }))

    const gql = {
      ...searchAssetsGql,
      variables: payload
    }

    await gqlRequestTyped<
      SearchAssetsInput,
      {searchAssets: SelectionOnSearchAssets}
    >(gql)
      .then((response) => {
        if (response.data) {
          const newData = response.data.searchAssets

          let combinedData: SelectionOnSearchAssets | null = newData

          // Append data if it's pagination (prevData provided)
          if (isPagination && prevData && newData) {
            combinedData = {
              ...newData,
              data: [...(prevData.data || []), ...(newData.data || [])]
            }
          }

          set((state) => ({
            querySearchAssetsData: {
              status: API_STATUS.SUCCESS,
              data: combinedData,
              error: null
            }
          }))
        }
      })
      .catch((error) => {
        set((state) => ({
          querySearchAssetsData: {
            status: API_STATUS.ERROR,
            data: current?.data || null,
            error
          }
        }))
      })
  },
  resetQuerySearchAssets: () => {
    set((state) => ({
      querySearchAssetsData: {
        status: API_STATUS.INIT,
        data: null,
        error: null
      }
    }))
  }
}))
