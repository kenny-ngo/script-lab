import {Component, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {Location} from '@angular/common';
import {Router, ActivatedRoute} from '@angular/router';
import {Tab, Tabs} from '../shared/components';
import {BaseComponent} from '../shared/components/base.component';
import {ISnippet, Snippet, SnippetManager} from '../shared/services';
import {Utilities, ContextType} from '../shared/helpers';

@Component({
    selector: 'editor',
    templateUrl: 'editor.component.html',
    styleUrls: ['editor.component.scss'],
    directives: [Tab, Tabs]
})
export class EditorComponent extends BaseComponent implements OnInit, OnDestroy {
    snippet = new Snippet({ meta: { name: 'New Snippet', id: null } });
    status: string;
    error: boolean;
    editMode: boolean = false;
    private timeout;

    @ViewChild(Tabs) tabs: Tabs;

    constructor(
        private _snippetManager: SnippetManager,
        private _location: Location,
        private _router: Router,
        private _route: ActivatedRoute
    ) {
        super();
    }

    ngOnInit() {
        var subscription = this._route.params.subscribe(params =>
            this._snippetManager.find(params['id'])
                .then(snippet => this.snippet = snippet)
                .catch(e => this._showStatus(e, true))
        );

        this.markDispose(subscription);
    }

    back() {
        this._router.navigate(['new']);
    }

    share() {

    }

    save() {
        try {
            this.snippet = this._composeSnippetFromEditor();
            this._snippetManager.save(this.snippet).then(snippet => {
                this._showStatus('Saved ' + snippet.meta.name);
            });
        }
        catch (e) {
            this._showStatus(e, true);
        }
    }

    delete() {
        try {
            this._snippetManager.delete(this.snippet).then(snippet => {
                this._showStatus('Deleted ' + this.snippet.meta.name)
                    .then(() => {
                        this._router.navigate(['new']);
                    });
            });
        }
        catch (e) {
            this._showStatus(e, true);
        }
    }

    run() {
        this._router.navigate(['run', this.snippet.meta.id]);
    }

    private _showStatus(message: string, error?: boolean) {
        return new Promise((resolve, reject) => {
            try {
                if (!Utilities.isNull(this.timeout)) clearTimeout(this.timeout);
                this.status = message;
                this.error = error;

                this.timeout = setTimeout(() => {
                    clearTimeout(this.timeout);
                    this.status = null;
                    this.error = false;
                    resolve();
                }, 5000);
            }
            catch (exception) {
                reject(exception);
            }
        });
    }

    private _composeSnippetFromEditor() {
        var currentEditorState = this.tabs.currentState;
        return new Snippet(<ISnippet>{
            meta: this.snippet.meta,
            css: currentEditorState['CSS'],
            extras: currentEditorState['Libraries'],
            ts: currentEditorState['JavaScript'],
            html: currentEditorState['HTML']
        });
    }
}