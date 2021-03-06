


AWFramework.PaginationPanel = AWFramework.AbstractConstraintPanel.extend({
	
	DEFAULT_ITEMS_PER_PAGE_LIST : [10,20,30,50,100,1000],
	
	DEFAULT_ITEMS_PER_PAGE : 10,
	respositoryName : null, 

	events :{
		"click [id^='pageSize_']" : 'onPageSize',
		"click #nextPage" : "onNextPage",
		"click #previousPage" : "onPreviousPage",
	},
	onPageSize : function(event){
		var value = event.currentTarget.id.split('_')[1];
		this.setPageSize(value);
		this.onConstraintChange();
	},

	setPageSize : function(pageSize){
		this.$('#itemsPerPage').html(pageSize);
		this.pagerOptions.current_page = 0;
		this.pagerOptions.items_per_page = Number(pageSize);
		this.$("#paginationPanel").pagination(this.source.getCount(), this.pagerOptions);		
	},

	reset : function(){
		this.pagerOptions.current_page = 0;
		this.$("#paginationPanel").pagination(this.source.getCount(), this.pagerOptions);

	},

	goToPage : function(p,q){
		if(this.pagerOptions.current_page != p){
			this.pagerOptions.current_page = p;
			this.onConstraintChange();
		}					
	},

	getConstraintModel : function(){
		this.constraintModel = new this.source.ConstraintModelPrototype();
		this.constraintModel.setPageSize(this.pagerOptions.items_per_page);
		this.constraintModel.setPageNumber(this.pagerOptions.current_page);
        return this.constraintModel;
    },

	initialize : function(options){
		AWFramework.AbstractConstraintPanel.prototype.initialize.call(this, options);
		this.options = options ? options : {};

		this.items_per_page = options.items_per_page;
		this.items_per_page_list = options.items_per_page_list;
		
		if(!this.items_per_page_list) {
			this.items_per_page_list = this.DEFAULT_ITEMS_PER_PAGE_LIST;
		};

		if(!this.items_per_page) {
			this.items_per_page = this.DEFAULT_ITEMS_PER_PAGE;

		};
		this.pagerOptions = {
				callback: this.goToPage.bind(this),
				current_page : 0,
				prev_text: '',
				next_text: '',
				items_per_page : this.items_per_page,
				num_display_entries : 4,
				num_edge_entries : 1
		};
		this.listenTo(this.source, 'source:constraintChange', this.update);  
		this.listenTo(this.source, 'source:refresh', this.update);      
	},

	makeDropDownListMenu : function(){
		var $ul = this.$('#itemsPerPageMenu');
		$ul.empty();
		for(var i = 0, l = this.items_per_page_list.length; i < l; i++){
			var name = this.items_per_page_list[i];
			var $li = $('<li><a id="pageSize_' + name + '" role="menuitem">' + name + '</a></li>');
			$ul.append($li);
		}
		this.$('#itemsPerPage').html(this.items_per_page);
	},

	onNextPage : function(){
		this.goToPage(this.pagerOptions.current_page+1);
	},
	onPreviousPage : function(){
		this.goToPage(this.pagerOptions.current_page-1);
	},
	update : function(constraintModel){
		this.source.getAll(null,function(){
			this.$('#previousPage,#nextPage').show();
			var offset = this.pagerOptions.current_page;
			if(offset == 0){
				this.$('#previousPage').hide();
			}
			
    		var size = Number(this.pagerOptions.items_per_page);
    		var total = this.source.getCount();
    		var to = (offset+1) * size;
    		to = to > total ? total : to;
    		var from = 1 + (offset * size);
    		from = from > total ? total : from;   		
    		if(to == total){
				this.$('#nextPage').hide();
			}
    		
    		var countStr = from+ '-' + to + ' OF ' + total;
    		if(this.respositoryName){
    			var repo = ' IN ' + this.respositoryName;
    			countStr += repo;
    		}
			this.$("#paginationPanel").pagination(this.source.getCount(), this.pagerOptions);
			this.$('#paginationCount').html(countStr);
			if(total == 0){
				this.$('#paginationCount').hide();
			}else {
				this.$('#paginationCount').show();			
			}
		}.bind(this));
	}
});

AWFramework.ScrollPaginationPanel = AWFramework.PaginationPanel.extend({

	_checkVisible : function( elm ) {
		var vpH = $(window).height(), // Viewport Height
			st = $(window).scrollTop(), // Scroll Top
			y = $(elm).offset().top,
			elementHeight = $(elm).height();
			//y = y * .8;
			return ((y < (vpH + st)*1.2) && (y > (st - elementHeight)));
	},

	initialize : function(options){
		AWFramework.AbstractConstraintPanel.prototype.initialize.call(this, options);
		this._timer = setInterval(this._onVisible.bind(this), 500)

	},

	putConstraintModel : function(constraintModel){
       // noop
    },

	getConstraintModel : function(){
		this.constraintModel = new this.source.ConstraintModelPrototype();
		this.constraintModel.setPageSize(this.PAGE_SIZE);
		this.constraintModel.setPageNumber(this.nextPage);
        return this.constraintModel;
    },
    _update : function(){
			this.source.getAll(null, function(data){
				if(this.source.getCount() <= (this.nextPage+1) * this.PAGE_SIZE ){
					this._$done.show();
					this.$el.hide();
				}else {
					this._requested = false;					
				}

			}.bind(this));
    },
	_onVisible : function(){
		if(this._checkVisible(this.el) && !this._requested){
			this._requested = true;
			this.nextPage++;
			this.onConstraintChange();
			this._update();

		}

	},
	reset : function(){
		this._requested = false;
		this.nextPage = 0;
		this._$done.hide();
		this.$el.show();
	},
	render : function(){
			this.$el.before('<div style="width:100%;height:40px;color:green;display:none;">Done.</div>');
			this._$done = this.$el.prev();
	},
	PAGE_SIZE : 8,
	nextPage : 0

});