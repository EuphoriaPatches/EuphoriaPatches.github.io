var player;$(function(){$(".site-navigation:not(.onclick) .navbar-nav>li.dropdown, .site-navigation:not(.onclick) li.dropdown>ul>li.dropdown").hover(function(){var o=$(this);n=setTimeout(function(){o.addClass("open").slideDown(),o.find(".dropdown-toggle").addClass("disabled")},0)},function(){clearTimeout(n),$(this).removeClass("open"),$(this).find(".dropdown-toggle").removeClass("disabled")}),$(".navbar-nav").slicknav({allowParentLinks:!0,label:"",appendTo:"#masthead",closedSymbol:'<i class="fa fa-caret-down" aria-hidden="true"></i>',openedSymbol:'<i class="fa fa-caret-up" aria-hidden="true"></i>'}),$(".slicknav_btn").click(function(){$(this).toggleClass("act"),$(this).hasClass("act")?$(".slicknav_menu").addClass("act"):$(".slicknav_menu").removeClass("act")}),$(document).on("click touchstart",function(n){$(".slicknav_menu").hasClass("act")&&$(n.target).hasClass("slicknav_nav")&&$(".slicknav_btn").click()}),$(".counter-item [data-to]").length>0&&$(".counter-item [data-to]").each(function(){var n=$(this),o=n.offset().top;$(window).scrollTop()>o-800&&!n.hasClass("counting")&&(n.addClass("counting"),n.countTo()),$(window).scroll(function(){$(window).scrollTop()>o-800&&!n.hasClass("counting")&&(n.addClass("counting"),n.countTo())})});var n,o,a,t,i,l,s=(a=(o=jQuery)("#grid"),t=o(".portfolio-sorting li"),i=function(){var n=t.children();n.on("click",function(n){n.preventDefault();var t=o(this),i=t.hasClass("active"),l=i?"all":t.data("group");i||o(".portfolio-sorting li a").removeClass("active"),t.toggleClass("active"),a.shuffle("shuffle",l)}),n=null},l=function(){var n=o.throttle(300,function(){a.shuffle("update")});a.find("img").each(function(){var a;(!this.complete||void 0===this.naturalWidth)&&(a=new Image,o(a).on("load",function(){o(this).off("load"),n()}),a.src=this.src)}),setTimeout(function(){n()},500)},{init:function(){setTimeout(function(){l(),i()},100),o("#grid .col-md-4").slice(0,4).show(),o("#loadMore").on("click",function(n){n.preventDefault(),o("#grid .col-md-4:hidden").slice(0,4).fadeIn().each(function(){a.shuffle("appended",o(this))}),0==o("#grid .col-md-4:hidden").length&&o("#loadMore").addClass("disabled").html("No more to Load")}),a.shuffle({itemSelector:'[class*="col-"]',group:Shuffle.ALL_ITEMS})}});$("#grid").length>0&&s.init()}());