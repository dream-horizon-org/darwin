import {CSSProperties} from '@material-ui/core/styles/withStyles'
import {COLORS} from './colors.theme'

type TypographyVariants =
  | 'display1'
  | 'display2'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'heading5'
  | 'body1'
  | 'body1Bold'
  | 'body2'
  | 'body2Bold'
  | 'body3'
  | 'body3Bold'
  | 'caption1'
  | 'caption2'
  | 'button1'
  | 'button2'
  | 'button3'
  | 'code'

// JS Doc for description and usage
/**
 * @class Typography
 * @classdesc
 * Typography class is used to create a typography object that can be used to style text.
 * @example
 * const typography = Typography.is('body1').with({color: 'red'}).toCSS()
 * // typography = {fontFamily: 'Roboto', color: 'red', fontSize: '12px', fontWeight: 400, fontStyle: 'normal'}
 * @example
 * headerText: Typography.is('heading1').with({color: 'red'}).toCSS()
 * // headerText = {fontFamily: 'Roboto', color: 'red', fontSize: '24px', fontWeight: 700, fontStyle: 'normal'}
 *
 * @param {TypographyVariants} variant - The variant of the typography object
 * @returns {Typography} - A typography object
 * @method with - A method that takes in a CSSProperties object and returns a typography object with the CSSProperties applied
 * @method toCSS - A method that returns the CSSProperties of the typography object
 * @example
 * const typography = Typography.is('body1').with({color: 'red'}).toCSS()
 * // typography = {fontFamily: 'Roboto', color: 'red', fontSize: '12px', fontWeight: 400, fontStyle: 'normal'}
 **/
export class Typography {
  private cssProps: CSSProperties = {}
  private TEXT_COLOR = COLORS.NEUTRAL[20]
  private FONT_FAMILY = 'Roboto, sans-serif'
  private CODE_FONT_FAMILY = 'Source Code Pro'
  private MARGIN = '0px'

  constructor(variant: TypographyVariants) {
    this.cssProps.fontFamily = this.FONT_FAMILY
    this.cssProps.color = this.TEXT_COLOR
    this.cssProps.margin = this.MARGIN
    switch (variant) {
      case 'display1':
        this.cssProps.fontSize = '56px'
        this.cssProps.fontWeight = 400
        this.cssProps.fontStyle = 'normal'
        break
      case 'display2':
        this.cssProps.fontSize = '44px'
        this.cssProps.fontWeight = 400
        this.cssProps.fontStyle = 'normal'
        break
      case 'heading1':
        this.cssProps.fontSize = '24px'
        this.cssProps.fontWeight = 700
        this.cssProps.fontStyle = 'normal'
        break
      case 'heading2':
        this.cssProps.fontSize = '20px'
        this.cssProps.fontWeight = 700
        this.cssProps.fontStyle = 'normal'
        break

      case 'heading3':
        this.cssProps.fontSize = '18px'
        this.cssProps.fontWeight = 700
        this.cssProps.fontStyle = 'normal'
        break

      case 'heading4':
        this.cssProps.fontSize = '16px'
        this.cssProps.fontWeight = 700
        this.cssProps.fontStyle = 'normal'
        break

      case 'heading5':
        this.cssProps.fontSize = '14px'
        this.cssProps.fontWeight = 700
        this.cssProps.fontStyle = 'normal'
        break

      case 'body1':
        this.cssProps.fontSize = '12px'
        this.cssProps.fontWeight = 400
        this.cssProps.fontStyle = 'normal'
        break

      case 'body1Bold':
        this.cssProps.fontSize = '12px'
        this.cssProps.fontWeight = 700
        this.cssProps.fontStyle = 'normal'
        break

      case 'body2':
        this.cssProps.fontSize = '14px'
        this.cssProps.fontWeight = 400
        this.cssProps.fontStyle = 'normal'
        break

      case 'body2Bold':
        this.cssProps.fontSize = '14px'
        this.cssProps.fontWeight = 700
        this.cssProps.fontStyle = 'normal'
        break

      case 'body3':
        this.cssProps.fontSize = '16px'
        this.cssProps.fontWeight = 400
        this.cssProps.fontStyle = 'normal'
        break

      case 'body3Bold':
        this.cssProps.fontSize = '16px'
        this.cssProps.fontWeight = 700
        this.cssProps.fontStyle = 'normal'
        break

      case 'caption1':
        this.cssProps.fontSize = '12px'
        this.cssProps.fontWeight = 400
        this.cssProps.fontStyle = 'normal'
        break

      case 'caption2':
        this.cssProps.fontSize = '10px'
        this.cssProps.fontWeight = 400
        this.cssProps.fontStyle = 'normal'
        break

      case 'button1':
        this.cssProps.fontSize = '16px'
        this.cssProps.fontWeight = 700
        this.cssProps.fontStyle = 'normal'
        break

      case 'button2':
        this.cssProps.fontSize = '14px'
        this.cssProps.fontWeight = 700
        this.cssProps.fontStyle = 'normal'
        break

      case 'button3':
        this.cssProps.fontSize = '12px'
        this.cssProps.fontWeight = 700
        this.cssProps.fontStyle = 'normal'
        break

      case 'code':
        this.cssProps.fontFamily = this.CODE_FONT_FAMILY
        this.cssProps.fontSize = '14px'
        this.cssProps.fontWeight = 400
        this.cssProps.fontStyle = 'normal'
        break

      default:
        this.cssProps.fontSize = '12px'
        this.cssProps.fontWeight = 400
        this.cssProps.fontStyle = 'normal'
        break
    }
  }

  public static is(variant: TypographyVariants): Typography {
    return new Typography(variant)
  }

  public with(props: Partial<CSSProperties>): Typography {
    this.cssProps = {...this.cssProps, ...props}
    return this
  }

  public toCSS(): CSSProperties {
    return this.cssProps
  }
}
