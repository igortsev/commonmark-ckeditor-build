import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { createDropdown, addToolbarToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import {opMacroPlugins} from "../op-plugins";

/**
 * Adding a drop down list of macros to the toolbar.
 *
 * @extends module:core/plugin~Plugin
 */
export default class OPMacroListPlugin extends Plugin {
	init() {
		const editor = this.editor;
		const dropdownTooltip = window.I18n.t('js.editor.macro.dropdown.chose_macro');

		// Register UI component.
		editor.ui.componentFactory.add( 'macroList', locale => {
			const dropdownItems = [];
			for ( const macroPlugin of opMacroPlugins ) {
				const listItem = editor.ui.componentFactory.create(macroPlugin.buttonName);
				dropdownItems.push(listItem);
			}
			const dropdownView = createDropdown( locale );

			addToolbarToDropdown(dropdownView, dropdownItems);
			dropdownView.buttonView.set( {
				isOn: false,
				withText: true,
				tooltip: dropdownTooltip,
				label: window.I18n.t('js.editor.macro.dropdown.macros')
			} );
			dropdownView.toolbarView.isVertical = true;
			dropdownView.toolbarView.className = 'op-macro-list-button'

			return dropdownView;
		} );
	}
}