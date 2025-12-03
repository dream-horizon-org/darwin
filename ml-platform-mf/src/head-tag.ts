import {textFieldComponentToken} from './MsdTheme'
import {aliasTokens} from './theme.contants'

export const headTagHtml = `<meta charset="UTF-8" />
    <title>Darwin</title>
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
    />
    <meta name="google" content="notranslate" />
    <meta name="robots" content="noindex" />
    <link rel="preconnect" href="https://d11.s3.amazonaws.com" />
    <style>
      a {
        color: inherit;
        text-decoration: inherit;
      }
      input[type='number'] {
        -moz-appearance: textfield;
      }
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      // TODO Move this to app css file
      input:-webkit-autofill:focus {
      --input_bg_color: ${textFieldComponentToken.selected_background_color};
      -webkit-box-shadow: 0 0 0 1000px var(--input_bg_color) inset !important; }
      input:-webkit-autofill {
       -webkit-text-fill-color: ${textFieldComponentToken.text_color} !important;
      --input_bg_color: ${textFieldComponentToken.selected_background_color};
      -webkit-box-shadow: 0 0 0 1000px var(--input_bg_color) inset !important; };
        }
    </style>`
