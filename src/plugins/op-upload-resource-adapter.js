export default class OpUploadResourceAdapter {
    constructor(loader, resource, editor) {
        this.loader = loader;
        this.resource = resource;
        this.editor = editor;
    }

    upload() {
		const resource = this.resource;
        if (!(resource && resource.uploadAttachments)) {
			const resourceContext = resource ? resource.name : 'Missing context';
            console.warn(`uploadAttachments not present on context: ${resourceContext}`);
            return Promise.reject("You're not allowed to upload attachments on this resource.");
		}

		return this.loader.file
			.then(file => {
			return resource
				.uploadAttachments([file])
				.then((result) => {
					this.editor.model.fire('op:attachment-added', result);

					return this.buildResponse(result[0])
				}).catch((error) => {
					console.error("Failed upload %O", error);
				});
		})

	}

	buildResponse(result) {
		return { default: result.uploadUrl };
	}

    abort() {
		return false;
    }
}
