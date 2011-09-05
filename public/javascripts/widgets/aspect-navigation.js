/*   Copyright (c) 2010, Diaspora Inc.  This file is
 *   licensed under the Affero General Public License version 3 or later.  See
 *   the COPYRIGHT file.
 */

(function() {
  Diaspora.Widgets.AspectNavigation = function() {
    var self = this;

    this.subscribe("widget/ready", function(evt, aspectNavigation) {
      $.extend(self, {
        aspectNavigation: aspectNavigation,
        aspectSelectors: aspectNavigation.find("a.aspect_selector[data-guid]"),
        homeSelector: aspectNavigation.find("a.home_selector"),
      });
      
      self.aspectSelectors.click(self.toggleSelection);
      self.aspectSelectors.debounce("click", self.performAjax, 250);
      self.homeSelector.click(self.selectAll);
    });
    
    this.selectedAspects = function() {
      return self.aspectNavigation.find("li.active[data-aspect_id]").map(function() { return $(this).data('aspect_id') });
    };
    
    this.toggleSelection = function(evt) {
      evt.preventDefault();
      
      $(this).parent().toggleClass("active");
    };

    this.selectAll = function(evt) {
      evt.preventDefault();
      
      var aspectLis = self.aspectSelectors.parent();
      
      if (aspectLis.not(".active").length === 0) {
        aspectLis.removeClass("active");
        
      } else {
        aspectLis.addClass("active");      
        self.performAjax();
      }
    };
        
    this.generateURL = function() {
      var baseURL = location.href.split("?")[0];

      // generate new url
      baseURL = baseURL.replace('#','');
      baseURL += '?';

      self.aspectSelectors.each(function() {
        var aspectSelector = $(this);
        if(aspectSelector.parent().hasClass("active")) {
          baseURL += "a_ids[]=" + aspectSelector.data("guid") + "&";
        }
      });

      if(!$("#publisher").hasClass("closed")) {
        // open publisher
        baseURL += "op=true";
      } else {
        // slice last '&'
        baseURL = baseURL.slice(0,baseURL.length-1);
      }
      return baseURL;
    };
    
    this.performAjax = function() {
      var post = $("#publisher textarea").val(),
        newURL = self.generateURL(),
        photos = {};
        
      //pass photos
   	  $('#photodropzone img').each(function() {
        var img = $(this);
        photos[img.attr("data-id")] = img.attr("src");
      });

      if (typeof(history.pushState) == 'function') {
        history.pushState(null, document.title, newURL);
      }
    
      if(self.jXHR) {
        self.jXHR.abort();
        self.jXHR = null;
      }
    
      self.fadeOut();
      self.jXHR = $.getScript(newURL, function(data) {
        var textarea = $("#publisher textarea"),
          photozone = $("#photodropzone");

        if( post !== "" ) {
          textarea.val(post).focus();
        }
        
        $.each(photos, function(GUID, URL) {
          photozone.append([
            '<li style="position: relative;">',
              '<img src="' + URL + ' data-id="' + GUID + '/>',
            '</li>'
          ].join(""));
        });
       
        self.globalPublish("stream/reloaded");
        self.fadeIn();
      });
    };
    
    this.fadeOut = function() {
      $("#aspect_stream_container").fadeTo(100, 0.4);
      $("#selected_aspect_contacts").fadeTo(100, 0.4);
    };
    
    this.fadeIn = function() {
      $("#aspect_stream_container").fadeTo(100, 1);
      $("#selected_aspect_contacts").fadeTo(100, 1);
    };
  };
})();