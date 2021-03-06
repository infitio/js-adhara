class SuggestionMetaField extends FormField{
    //THIS IS A META CLASS ONLY, to be used inside other select classes..!

    /**
     * @extends {FormField}
     * @param {SuggestionDataProvider} config.dataProvider
     * */
    constructor(name, config, settings){
        super(name, config, settings);
        if(!(config.data_provider instanceof SuggestionDataProvider)){
            //TODO throw error...
            // throw new Error(`field config error: ${this.name} | dataProvider must be an instance of SuggestionDataProvider`);
        }
        this.parentChanged = false;
        this.term = "";
        this.page = 1;
        this.paginated_hints = [];
        this.hint = new SuggestionHintsMetaField({
            c: `.hints#${this.ts}`,
            options: {
                hint_template: config.hint_template
            }
        });
        this.hint.onHintSelected((hint)=>{
            this.handleHintSelection(false,);
        });
        this.hint.onScrollHitBottom(()=>{
            this.updateHints({page: this.page+1}).then(_ => _);
        });
        this.tasker = new CoalesceTasker(500);
    }

    get template(){
        return "adhara-form-fields/suggestions";
    }

    get events(){
        return ["HintSelected", "HintDeleted", "Focused", "Blurred"];
    }

    get defaultFieldAttributes(){
        return {};
    }

    update(term, append=false){
        let i = this.getParentContainerElement().querySelector("input");
        i.focus();
        i.setAttribute('autofocus', "true");
        i.dispatchEvent(new Event("focus"));
        if(term!==undefined){
            if(append) i.value += term;
            else i.value = term;
            i.dispatchEvent(new Event("change"));
        }
    }

    hide(){
        let i = this.getParentContainerElement().querySelector("input");
        i.removeAttribute('autofocus');
    }

    onFocus(e, d){
        (this.config.hide_input!==false) && this.getField().classList.remove("d-none");
        if(this.parentChanged || !this.hint.hints || !this.hint.hints.length){
            this.updateHints({start_fetching: true}).then(()=>{});
            this.parentChanged = false;
        }else{
            this.hint.show();
        }
        this.trigger("Focused", e, d);
    }

    onBlur(e, d){
        setTimeout(()=>{
            if(e.target.name !== document.activeElement.name){
                this.hint.hide();
                (this.config.hide_input!==false) && this.getField().classList.add("d-none");
                this.trigger("Blurred", e, d);
            }
        }, 1000);
        //TODO try to remove this delay!!!
        // Delay is used to safely closing the dropdown, so it can be opened again!
        // If no delay is used, dropdown won't open again!

    }

    handleHintSelection(isDeleted=false){
        this.trigger(isDeleted?"HintDeleted":"HintSelected", this.hint.selectedHint);
        this.updateHints({term: "", re_fetch: true}).then(_=>_);
        this.selected_hint = this.hint.selectedHint;
        // this.hint.reset();
    }

    async onKeyDown(event, data){
        let key = event.which;
        if(key===ESCAPE){
            /*this.hint.hints = [];
            // this.hint.hide();
            event.preventDefault();*/
        }else if(/*key===TAB || */key===ENTER){
            if(this.hint.selectedHint){
                this.handleHintSelection(false);
            }
            event.preventDefault();
        }else if(key===UP_ARROW){
            if(!this.hint.hints || !this.hint.hints.length){
                await this.updateHints({start_fetching: true});
            }else{
                this.hint.cursorUp();
            }
            event.preventDefault();
        }else if(key===DOWN_ARROW){
            if(!this.hint.hints || !this.hint.hints.length){
                await this.updateHints({start_fetching: true});
            }else{
                this.hint.cursorDown();
            }
            event.preventDefault();
        }else if(key===BACKSPACE && !event.target.value){
            this.handleHintSelection( true);
        }
    }

    async onTermChange(event, data){
        await this.updateHints({term: event.target.value});
    }

    get isTermChanged(){
        if(this.querying_results_for_term){
            return this.querying_results_for_term !== this.term;
        }
        return this.showing_results_for_term !== this.term;
    }

    get isPageChanged(){
        if(this.querying_results_for_page){
            return this.page > this.querying_results_for_page;
        }
        if(this.showing_results_for_page){
            return this.page > this.showing_results_for_page;
        }
        return true;
    }

    get isHintUpdated(){
        let oldHint = this.selected_hint && this.selected_hint.value;
        let newHint = this.hint.selectedHint && this.hint.selectedHint.value;
        return newHint !== oldHint;
    }

    canFetchHints(new_term){
        return this.isHintUpdated || this.isTermChanged || this.isPageChanged;
    }

    isNewTerm(term){
        return (term !== this.term) && (term !== this.querying_results_for_term);
    }

    async updateHints(options){
        let start_fetching = options.start_fetching===true;
        let is_new_term = start_fetching || (options.term!==undefined && this.isNewTerm(options.term));
        let is_new_page = start_fetching || options.page!==undefined;
        let force_re_fetch = options.re_fetch===true;

        let page = is_new_page?(options.page||1):1;
        if(is_new_term || force_re_fetch) page = 1;

        let term = options.term || (options.page?this.term:"");
        let has_next_page = page===1 || this.config.data_provider.hasNextPage;

        if(!has_next_page) return;
        if(!is_new_term && !is_new_page && !force_re_fetch) return false;
        this.querying_results_for_term = term;
        this.querying_results_for_page = page;
        return await this.tasker.execute(async ()=>{
            if(page===1){
                let results = await this.config.data_provider.getFirstPage(term);
                if(this.querying_results_for_term !== term) return;
                this.paginated_hints = results;
            }else{
                let results = await this.config.data_provider.getNextPage();
                if(this.querying_results_for_term !== term) return;
                this.paginated_hints.push(...results);
            }
            this.hint.hints = this.paginated_hints;
            this.querying_results_for_term = null;
            this.querying_results_for_page = null;
            this.term = term;
            this.page = page;
        });
    }

    get subViews(){
        return [this.hint];
    }

}

class SuggestionDataProvider{

    /**
     * @param {Array<Object>} data
     * @param {String|Number} data.value - value to be attained as selected value
     * @param {String} data.display - display string
     * @example
     * SuggestionDataProvider([
     *  {value: 1, display: "One"},
     *  {value: 2, display: "Two"},
     *  {value: 3, display: "Three"},
     * ]
     * */
    constructor(data = []){
        this.data = data;
    }

    get hasNextPage(){
        return false;
    }

    async getFirstPage(term){
        return this.data.filter(_ => _.display.indexOf(term)!==-1);
    }

    async getNextPage(){
        return [];
    }

}