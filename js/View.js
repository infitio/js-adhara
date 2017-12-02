/**
 * @class
 * @classdesc a base class that is to be extended by all the view classes
 * */
class AdharaView{

    constructor(){
        Adhara.instances[this.constructor.name] = this;
    }

    get data(){
        return {};
    }

    get template(){
        if(AdharaRouter.getCurrentPageName()){
            return AdharaRouter.getCurrentPageName().replace(/_/g, "-");
        }else{
            let className = this.constructor.name.toLowerCase();
            if(className.endsWith("view")){
                return className.slice(0, className.length - 4);
            }else{
                return className;
            }
        }
    }

    get contentSelector(){
        throw new Error("Not implemented");
    }

    render(containerSelector){
        this.container = document.querySelector(containerSelector);
        this.container.innerHTML = Handlebars.templates[this.template](this.data);
        this.postProcess(this.container);
    }

    postProcess(container){
        //Do something with the DOMContent
    }

    getContentContainer(){
        return this.DOMcontent.querySelector(this.contentSelector);
    }

}