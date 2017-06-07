
import { makeStartTag, makeEndTag, encodeHtml, ITagKeyValue } from './funcs-html';
import { DeltaInsertOp } from './DeltaInsertOp';
import { ScriptType, NewLine } from './value-types';
import './extensions/String';
import './extensions/Object';
import { IOpAttributes } from './IOpAttributes';
import './extensions/Array';


interface IOpToHtmlConverterOptions {
    classPrefix?: string,
    encodeHtml?: boolean,
    listItemTag?: string,
    paragraphTag?: string
}

interface IHtmlParts {
    openingTag: string,
    content: string,
    closingTag: string,
}

class OpToHtmlConverter {

    private options: IOpToHtmlConverterOptions;
    private op: DeltaInsertOp;
    constructor(op: DeltaInsertOp, options?: IOpToHtmlConverterOptions) {
        this.op = op;
        this.options = Object._assign({}, { 
            classPrefix: 'ql',
            encodeHtml: true,
            listItemTag: 'li',
            paragraphTag: 'p'
        }, options);
    }

    prefixClass(className: string): string {
        if (!this.options.classPrefix) {
            return className + '';
        }
        return this.options.classPrefix + '-' + className;
    }

    getHtml(): string {
        var parts = this.getHtmlParts();
        return parts.openingTag + parts.content + parts.closingTag;
    }

    getHtmlParts(): IHtmlParts {
        
        if (this.op.isJustNewline() && !this.op.isContainerBlock()) {
            return {openingTag: '', closingTag: '', content: NewLine};
        }

        let tags = this.getTags(), attrs = this.getTagAttributes();
        
        if (!tags.length && attrs.length) {
            tags.push('span');
        }
        
        let beginTags = [], endTags = [];

        for (var tag of tags) {
            beginTags.push(makeStartTag(tag,  attrs));
            endTags.push(tag === 'img' ? '' : makeEndTag(tag));
            // consumed in first tag
            attrs = null;
        }
        endTags.reverse();

        return {
            openingTag: beginTags.join(''),
            content: this.getContent(), 
            closingTag: endTags.join('')
        };
    }

    getContent(): string {
        if (this.op.isContainerBlock()) {
            return '';
        }
        if (this.op.isMention()) {
            return this.op.insert.value.name;
        }
        var content = this.op.isFormula() || this.op.isText() ? this.op.insert.value : '';
        return this.options.encodeHtml && encodeHtml(content) || content;
    }

    getCssClasses(): string[] {
        
        var attrs: any = this.op.attributes;

        type Str2StrType = { (x: string): string };

        return ['indent', 'align', 'direction', 'font', 'size']
            .filter((prop) => !!attrs[prop])
            .map((prop) => prop + '-' + attrs[prop])
            .concat(this.op.isFormula() ? 'formula' : [])
            .concat(this.op.isVideo() ? 'video' : [])
            .concat(this.op.isImage() ? 'image' : [])
            .map(<Str2StrType>this.prefixClass.bind(this));
    }


    getCssStyles(): string[] {
        
        var attrs: any = this.op.attributes;

        return [['background', 'background-color'], ['color']]
            .filter((item) => !!attrs[item[0]])
            .map((item: any[]) => item._preferSecond() + ':' + attrs[item[0]]);
    }

    getTagAttributes(): Array<ITagKeyValue> {
        if (this.op.attributes.code) {
            return [];
        }

        const makeAttr = (k: string, v: string): ITagKeyValue => ({ key: k, value: v });

        var classes = this.getCssClasses();
        var tagAttrs = classes.length ? [makeAttr('class', classes.join(' '))] : [];

        if (this.op.isImage()) {
            return tagAttrs.concat(makeAttr('src', (this.op.insert.value + '')._scrubUrl()));
        }

        if (this.op.isFormula() || this.op.isContainerBlock()) {
            return tagAttrs;
        }

        if (this.op.isVideo()) {
            return tagAttrs.concat(
                makeAttr('frameborder', '0'),
                makeAttr('allowfullscreen', 'true'),
                makeAttr('src', (this.op.insert.value + '')._scrubUrl())
            );
        }

        if (this.op.isMention()) {
            return tagAttrs.concat(
                makeAttr('data-user', (this.op.insert.value.user + '')),
                makeAttr('data-name', (this.op.insert.value.name + '')),
                makeAttr('class', 'mention')
            );
        }

        var styles = this.getCssStyles();
        var styleAttr = styles.length ? [makeAttr('style', styles.join(';'))] : [];

        return tagAttrs
            .concat(styleAttr)
            .concat(this.op.isLink() ? makeAttr('href', this.op.attributes.link) : []);
    }

    getTags(): string[] {
        var attrs: any = this.op.attributes;

        // code 
        if (attrs.code) {
            return ['code'];
        }

        // embeds
        if (!this.op.isText()) {
            return [this.op.isVideo() ? 'iframe'
                : this.op.isImage() ? 'img'
                    :  'span' // formula 
            ]
        }

        // blocks 
        var positionTag = this.options.paragraphTag || 'p';

        var blocks = [['blockquote'], ['code-block', 'pre'], 
                    ['list', this.options.listItemTag ], ['header'],
                        ['align', positionTag], ['direction', positionTag], 
                            ['indent', positionTag]];
        for (var item of blocks) {
            if (attrs[item[0]]) {
                return item[0] === 'header' ? ['h' + attrs[item[0]]] : [item._preferSecond()];
            }
        }

        // inlines  
        return [['link', 'a'], ['script'],
        ['bold', 'strong'], ['italic', 'em'], ['strike', 's'], ['underline', 'u']
        ]
            .filter((item: any[]) => !!attrs[item[0]])
            .map((item) => {
                return item[0] === 'script' ?
                    (attrs[item[0]] === ScriptType.Sub ? 'sub' : 'sup')
                    : item._preferSecond();
            });
    }


}

export { OpToHtmlConverter, IOpToHtmlConverterOptions, IHtmlParts };