class AdharaApp{

    /**
     * @function
     * @instance
     * @return {Boolean} Whether the app is being accessed in development mode or in production mode
     * */
    get debug(){
        return (
            ["localhost", "127.0.0.1", "0.0.0.0"].indexOf(window.location.hostname)!==-1
            || window.location.hostname.indexOf("192.168.")!==-1
        );
    }

    /**
     * @function
     * @instance
     * @return {String} App name
     * */
    get name(){
        return "Adhara App"
    }

    /**
     * @function
     * @instance
     * @return {Object} App name in detail. Like first and last name
     * */
    get detailedName(){
        return {
            first: "Adhara",
            last: "App"
        }
    }

    /**
     * @function
     * @instance
     * @return {String} Tag line
     * */
    get tagLine(){ }

    /**
     * @function
     * @instance
     * @return {AdharaView} Container view class
     * */
    get containerView(){ }

    /**
     * @function
     * @instance
     * @return {Object} Adhara style app config
     * */
    get config(){ return {}; }

    /**
     * @function
     * @instance
     * @return {Object} Adhara style entity config
     * */
    getEntityConfig(context_name){
        let context = this.config[context_name];
        let allowed_query_types = context.data_config.allowed_query_types?context.data_config.allowed_query_types.slice():[];
        let data_config;
        if(context.data_config.hasOwnProperty("batch_data_override")){
            data_config = {
                batch_data_override: context.data_config.batch_data_override.map(batch_data_config => {
                    return {
                        url: batch_data_config.url,
                        query_type: batch_data_config.query_type,
                        identifier: batch_data_config.identifier,
                        blob: batch_data_config.blob
                    }
                })
            }
        }else{
            data_config = {
                url: context.data_config.url,
                allowed_query_types: allowed_query_types,
                default_query_type: context.data_config.default_query_type || allowed_query_types[0],
                socket_tag: context.data_config.socket_tag,
                reuse: context.data_config.reuse,
                blob: context.data_config.blob
            }
        }
        return {
            data_config,
            view: context.view,
            processor: context.processor
        }
    }

    /**
     * @getter
     * @instance
     * @returns {Object} Custom global view configurations
     * */
    get customViewConfig(){
        return {
            fetching_data: {
                AdharaListView: "Fetching Data..."
            },
            no_data: {
                AdharaListView: "No Data Available"
            }
        }
    }

    /**
     * @function
     * @instance
     * @returns {Array<String>} list of http methods to be allowed by the application.
     * @description This getter can be configured to return allowed methods based on the current network state.
     * Say if offline, it can be configured to just return `["get"]` method which will restrict DataInterface from making
     * other service API calls such as "post", "delete", etc...
     * */
    get allowedHttpMethods() {
        return ['get', 'post', 'put', 'delete'];  // all available API methods
        // offline mode will switch a few of these off (post, put and delete)
    }

    /**
     * @function
     * @instance
     * @return {AdharaRouterConfiguration} Adhara style routing config
     * */
    get routerConfiguration(){
        return {
            routes: [],
            on_route_listeners: {},
            middlewares: []
        }
    }

    /**
     * @function
     * @instance
     * @returns {String} A css selector in which app is to be rendered.
     * */
    get DOMSelector(){
        return "app";   //=> search DOM for `<app></app>`
    }

    /**
     * @function
     * @instance
     * @returns {String} API Server URL. Either the base path or a full url till base path.
     * */
    get apiServerURL(){
        return "/api";
    }

    /**
     * @function
     * @instance
     * @returns {Object} WebSocket config object.
     * sample...
     * {
     *  url: "sub.domain.com:9081"
     * }
     * */
    get webSocketConfig(){ }

    /**
     * @function
     * @instance
     * @param {String} title - toast message title
     * @param {String} content - toast message content
     * @param {String} type - toast message type. can take the values "success"|"error"|"info".
     * */
    toast(title, content, type){
        AdharaDefaultToaster.make(title, content, type);
    }

}
