import React, {MouseEvent} from 'react'
import {Tags, TagsType} from '../../../../bit-components/tags/tags/index'
import {IColumnConfig} from '../../../../types/columnConfig.type'

import LoadingSkeleton from '../../../../components/loadingSkeleton/loadingSkeleton'

const getColumnConfig = (
  classes,
  onTagClicked: (e, item) => void,
  expandAllRows: boolean,
  onExpandAllRowsToggle: (e: MouseEvent) => void
): IColumnConfig[] => {
  return [
    {id: 'title', label: 'FEATURE GROUPS'},
    {
      id: 'version',
      label: 'VERSION',
      padding: 'normal',
      jsx: (_: any, item, isChild) => {
        if (item.loadingVersions && isChild) {
          return <LoadingSkeleton />
        }

        return <span>{item.version}</span>
      }
    },
    {
      id: 'status',
      label: 'STATUS',
      padding: 'normal',
      minColumnWidth: '150px',
      jsx: (_: any, item, isChild) => {
        if (item.loadingVersions && isChild) {
          return <LoadingSkeleton />
        }
        return <Tags label={item.status} type={TagsType?.Valid} />
      }
    },
    {
      id: 'description',
      label: 'DESCRIPTION',
      padding: 'normal',
      jsx: (_: any, item, isChild) => {
        if (item.loadingVersions && isChild) {
          return <LoadingSkeleton />
        }

        return <span>{item.description}</span>
      }
    },
    {
      id: 'tags',
      label: 'TAGS',
      padding: 'normal',
      jsx: (_: any, item, isChild) => {
        if (item.loadingVersions && isChild) {
          return <LoadingSkeleton />
        }
        const tags = []
        for (let i = 0; i < item.tags.length; i++) {
          const tag = item.tags[i]
          if (i <= 1) {
            const ele = (
              <div className={classes.tag}>
                <Tags label={tag} type={TagsType?.Default} />
              </div>
            )
            tags.push(ele)
          } else if (i === 2) {
            const ele = (
              <p
                className={classes.moreTags}
                onClick={(e) => onTagClicked(e, item)}
              >
                +{item.tags.length - 2}
              </p>
            )
            tags.push(ele)
          } else {
            break
          }
        }

        return <div className={classes.tags}>{tags}</div>
      }
    },
    {
      id: 'dateCreated',
      label: 'DATE CREATED',
      padding: 'normal',
      jsx: (_: any, item, isChild) => {
        if (item.loadingVersions && isChild) {
          return <LoadingSkeleton />
        }

        return <span>{new Date(item.dateCreated).toDateString()}</span>
      }
    },
    {
      id: 'createdBy',
      label: 'CREATED BY',
      padding: 'normal',
      jsx: (_: any, item, isChild) => {
        if (item.loadingVersions && isChild) {
          return <LoadingSkeleton />
        }

        return <span>{item.createdBy}</span>
      }
    }
  ]
}

export default getColumnConfig
