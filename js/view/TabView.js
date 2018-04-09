class AdharaTabView extends AdharaView{

    get template(){
        return "adhara-tab-view";
    }

    get containerClass(){
        return 'nav nav-pills';
    }

    get tabNavClass(){
        return 'custom-tabs-line tabs-line-bottom left-aligned';
    }

    get tabListClass(){
        return "nav";
    }

    get tabs(){
        return [];
    }

    /**
     * @getter
     * @instance
     * @returns {Object} Active tab configuration
     * */
    get currentTab(){
        let current_tab_link_from_url = Adhara.router.getCurrentURL();
        let current_Tab = this.tabs.filter(tab=>tab.link===current_tab_link_from_url);
        return current_Tab.length?current_Tab[0]:this.tabs[0];
    }

    get tabsList(){
        let current_tab_id = this.currentTab.id;
        return this.tabs.map(tab => {
            tab.className = (tab.id === current_tab_id)?"active":"";
            return tab;
        });
    }

    get nextSelector(){
        return '.btn-next';
    }

    get previousSelector(){
        return '.btn-previous';
    }

    onTabShow() {

    }

    onTabClick(){

    }

    onTabChange(){

    }

    /*onShow(){

    }*/

    format(){

    }

    get contentContainer(){
        return ".tab-content .tab-pane";
    }

    renderSubViews(){
        Adhara.createView(Adhara.getView(this.currentTab.view, this));
    }

}