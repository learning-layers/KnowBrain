//define(['logger', 'voc', 'underscore', 'data/Data'], function(Logger, Voc, _, Data){
var CollectionData = (function(){
    var m = Object.create(Data);
    m.init = function(vie) {
        this.LOG.debug("initialize CollectionData");
        this.vie = vie;
        this.vie.entities.on('add', this.filter, this);
        this.setIntegrityCheck(Voc.hasEntity, Voc.THING);
    };
    m.LOG = Logger.get('CollectionData');
    /** 
     * Filters entities from added entities to vie.entities
     */
    m.filter= function(model, collection, options) {
        if(model.isof(Voc.COLLECTION)){
            this.checkIntegrity(model, options);
            if( !model.isNew() ) {
                this.fetchContents(model);
            } else {
                this.LOG.debug("new collection added", model);
            }
        }
    };
    m.fetchContents= function(collection) {
        var em = this;
        this.vie.load({
            'service' : 1,
            'collection' : collection.getSubject(),
        }).from('sss').execute().success(
            function(entities) {
                em.LOG.debug("success fetchContents");
                em.LOG.debug("entities", entities);
                entities = em.vie.entities.addOrUpdate(entities);
                var hasEntity = [];
                _.each(entities, function(entity) {
                    hasEntity.push(entity.getSubject());
                });
                collection.set(Voc.hasEntity, hasEntity);
            }
        );

    };
    return m;
})();
