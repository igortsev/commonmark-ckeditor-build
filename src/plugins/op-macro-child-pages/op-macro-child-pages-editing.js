// This SVG file import will be handled by webpack's raw-text loader.
// This means that imageIcon will hold the source SVG.
import imageIcon from './../../icons/hierarchy.svg';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { downcastElementToElement } from '@ckeditor/ckeditor5-engine/src/conversion/downcast-converters';
import {upcastElementToElement} from '@ckeditor/ckeditor5-engine/src/conversion/upcast-converters';
import ViewPosition from '@ckeditor/ckeditor5-engine/src/view/position';
import {toChildPagesMacroWidget} from './utils';

export default class OPChildPagesEditing extends Plugin {

	static get pluginName() {
		return 'OPChildPagesEditing';
	}

	init() {
		const editor = this.editor;
		const model = editor.model;
		const conversion = editor.conversion;
		const pluginContext = editor.config.get('openProject.pluginContext');

		// Schema.
		model.schema.register( 'op-macro-child-pages', {
			allowWhere: ['$block'],
			allowAttributes: ['page'],
			isBlock: true,
			isLimit: true
		});

		conversion.for( 'upcast' )
			.add( upcastElementToElement( {
				view: {
					name: 'macro',
					classes: 'child_pages'
				},
				model: ( viewElement, modelWriter ) => {
					const page = viewElement.getAttribute( 'data-page' ) || '';
					const includeParent = viewElement.getAttribute( 'data-include-parent' ) == 'true';

					return modelWriter.createElement(
						'op-macro-child-pages',
						{
							page: page,
							includeParent: includeParent
						}
					);
				}
			} ) );


		conversion.for( 'editingDowncast' ).add(downcastElementToElement({
			model: 'op-macro-child-pages',
			view: (modelElement, writer) => {
				return this.createMacroViewElement(modelElement, writer);
			}
		}));

		conversion.for('dataDowncast').add(downcastElementToElement({
			model: 'op-macro-child-pages',
			view: (modelElement, writer) => {
				const element = writer.createContainerElement(
					'macro',
					{
						'class': 'child_pages',
						'data-page': modelElement.getAttribute('page') || '',
						'data-include-parent': modelElement.getAttribute('includeParent') || ''
					}
				);

				return element;
			}
		}));

		editor.ui.componentFactory.add( 'insertChildPages', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: window.I18n.t('js.editor.macro.child_pages.button'),
				icon: imageIcon,
				tooltip: true
			} );

			// Callback executed once the image is clicked.
			view.on( 'execute', () => {
				editor.model.change(writer => {
					const element = writer.createElement( 'op-macro-child-pages', {});

					editor.model.insertContent( element, editor.model.document.selection );
				});
			} );

			return view;
		} );
	}

	macroLabel() {
		return window.I18n.t('js.editor.macro.child_pages.text');
	}

	pageLabel(page) {
		if (page && page.length > 0) {
			return page
		} else {
			return window.I18n.t('js.editor.macro.child_pages.this_page');
		}
	}

	includeParentText(includeParent) {
		if (includeParent) {
			return ` (${window.I18n.t('js.editor.macro.child_pages.include_parent')})`;
		} else {
			return '';
		}
	}

	createMacroViewElement(modelElement, writer) {
		// TODO: Pass page, it is not updated on coming back from the modal..
		const page = modelElement.getAttribute('page');
		const includeParent = modelElement.getAttribute('includeParent');
		const macroLabel = this.macroLabel();
		const pageLabel = this.pageLabel(page);
		const pageLabelContainer = writer.createContainerElement( 'span', { class: 'macro-value' } );
		const placeholderContainer = writer.createContainerElement( 'div', { class: 'macro -child_pages' } );

		let placeholderContent = [ writer.createText( `${macroLabel} ` ) ];
		writer.insert( ViewPosition.createAt( pageLabelContainer ), writer.createText( `${pageLabel}` ) )
		placeholderContent.push( pageLabelContainer );
		placeholderContent.push( writer.createText( this.includeParentText(includeParent) ));
		writer.insert( ViewPosition.createAt( placeholderContainer ), placeholderContent );
		return toChildPagesMacroWidget(placeholderContainer, writer, { label: macroLabel } )
	}
}