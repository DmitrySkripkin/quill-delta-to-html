
import { ListType, AlignType, DirectionType, ScriptType } from './value-types';

interface IOpAttributes {
    background?: string,
    color?: string,
    font?: string,
    size?: string,

    link?: string,
    bold?: boolean,
    italic?: boolean,
    underline?: boolean,
    strike?: boolean,
    script?: ScriptType,

    code?: boolean,

    list?: ListType,
    blockquote?: boolean,
    'code-block'?: boolean,
    header?: number,
    align?: AlignType,
    direction?: DirectionType,
    indent?: number,
    user?: string,
    name?: string,

    url?: string,
    filename?: string,
    hash?: string,
    preview?: string,
    type?: string,
    extension?: string,
    // size?: string,
    width?: string,
    height?: string,


}

export { IOpAttributes };