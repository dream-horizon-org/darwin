import config from 'config'
import React from 'react'
import {ButtonSizes} from '../button/index'
import {CompositionWrapper} from '../composition-wrapper/index'
import {TagsCounter} from '../tags/tags-counter/index'
import {TextButton} from '../text-button/index'
import {Accordion} from './accordion'
import {AccordianStateList} from './constants'

const iconMockFun = () => {
  const headElements = document.getElementsByTagName('HEAD')
  const head = headElements?.[0]
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `${config.cfBitComponentsUrl}/fontIcons/styles.css`
  head.appendChild(link)
}

export const Default = () => {
  iconMockFun()
  return (
    <CompositionWrapper lists={{disabled: AccordianStateList}}>
      <Accordion
        title='Accordion Title'
        body={
          <p style={{color: 'GrayText'}}>
            Accordion is a component that organizes content within collapsable
            items. Accordion allows the display of only one collapsed item at a
            time.
          </p>
        }
      />
    </CompositionWrapper>
  )
}

export const Description = () => {
  iconMockFun()
  return (
    <CompositionWrapper lists={{disabled: AccordianStateList}}>
      <Accordion
        title='Accordion Title'
        desc='Description'
        body={
          <p style={{color: 'GrayText'}}>
            Accordion is a component that organizes content within collapsable
            items. Accordion allows the display of only one collapsed item at a
            time.
          </p>
        }
      />
    </CompositionWrapper>
  )
}
Description.compositionName = 'Title + Description'

export const Count = () => {
  iconMockFun()
  return (
    <CompositionWrapper lists={{disabled: AccordianStateList}}>
      <Accordion
        title='Accordion Title'
        actionStatusNode={<TagsCounter counter={232} />}
        body={
          <p style={{color: 'GrayText'}}>
            Accordion is a component that organizes content within collapsable
            items. Accordion allows the display of only one collapsed item at a
            time.
          </p>
        }
      />
    </CompositionWrapper>
  )
}

Count.compositionName = 'Title + Counter'

export const ActionNode = () => {
  iconMockFun()
  return (
    <CompositionWrapper lists={{disabled: AccordianStateList}}>
      <Accordion
        title='Accordion Title'
        actionNode={
          <TextButton
            onClick={() => alert('button clicked')}
            size={ButtonSizes.SMALL}
            buttonText={'BUTTON'}
          />
        }
        body={
          <p style={{color: 'GrayText'}}>
            Accordion is a component that organizes content within collapsable
            items. Accordion allows the display of only one collapsed item at a
            time.
          </p>
        }
      />
    </CompositionWrapper>
  )
}

ActionNode.compositionName = 'Title + ActionNode'

export const DescriptionCountAndActionNode = () => {
  iconMockFun()
  return (
    <CompositionWrapper lists={{disabled: AccordianStateList}}>
      <Accordion
        title='Accordion Title'
        desc='Description'
        actionStatusNode={<TagsCounter counter={0} />}
        actionNode={
          <TextButton
            onClick={() => alert('button clicked')}
            size={ButtonSizes.SMALL}
            buttonText={'BUTTON'}
          />
        }
        body={
          <p style={{color: 'GrayText'}}>
            Accordion is a component that organizes content within collapsable
            items. Accordion allows the display of only one collapsed item at a
            time.
          </p>
        }
      />
    </CompositionWrapper>
  )
}

DescriptionCountAndActionNode.compositionName =
  'Title + Counter + Desc + ActionNode'
