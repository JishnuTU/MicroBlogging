var activityController = require('../controller/activityController');
var notificationController =  require('../controller/notificationController');
var adminController =  require('../controller/adminController');
var Verify    = require('./verify');
var loadController =require('../controller/loadController');
 module.exports = function(socket,io){

   // for search
  	socket.on('search', function(data) {
  		Verify.verifySocketUser(data.token,function(procced){
  			if(procced){
  					    activityController.searchFor(data.userId,data.name,function(result){
						return io.to(socket.id).emit("searchresult", result);
					});
  			}
  			else
  			{
  				return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
  			}
  		});

    });
  	// for follow a user
  	socket.on('follow',function(data){
  		Verify.verifySocketUser(data.token,function(procced){
  			if(procced){
  					    activityController.followHim(data.followerId,data.followingId);
  						}
  			else
  			{
  				return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
  			}
  		});
  		
  	});
  	// for unfollow a user
  	socket.on('unfollow',function(data){
  		Verify.verifySocketUser(data.token,function(procced){
  			if(procced){
  					    activityController.unfollowHim(data.followerId,data.followingId);
  						}
  			else
  			{
  				return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
  			}
  		});
  		
  	});
  	// for post a blog
  	socket.on('postblog',function(data){
  		Verify.verifySocketUser(data.token,function(procced){
  			if(procced){
  					    activityController.postblogs(data.ownerId,data.title,data.body,function(msg){
  					    		return io.to(socket.id).emit("replypost",msg);
  					    	});
  						}
  			else
  			{
  				return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
  			}
  		});
  	});

// to collect the posts
  	socket.on('gatherposts',function(data){
  		Verify.verifySocketUser(data.token,function(procced){
  			if(procced){
  					    activityController.postpacking(data.userId,function(error,allPost){
  					    		if(error)
  					    			return io.to(socket.id).emit("gatheredpost","Server Error");
  					    		else
  					    			return io.to(socket.id).emit("gatheredpost",allPost);
  					    	});
  						}
  			else
  			{
  				return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
  			}
  		});
  	});

    socket.on('gathernewposts',function(data){
      Verify.verifySocketUser(data.token,function(procced){
        if(procced){
                loadController.postpackingBefore(data.userId,data.newdate,function(error,allPost){
                    if(error)
                      return io.to(socket.id).emit("gatheredNewpost","Server Error");
                    else
                      return io.to(socket.id).emit("gatheredNewpost",allPost);
                  });
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });


    socket.on('gatheroldposts',function(data){
      Verify.verifySocketUser(data.token,function(procced){
        if(procced){
                loadController.postpackingAfter(data.userId,data.olddate,function(error,allPost){
                    if(error)
                      return io.to(socket.id).emit("gatheredOldpost","Server Error");
                    else
                      return io.to(socket.id).emit("gatheredOldpost",allPost);
                  });
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });



    socket.on('interestInsert',function(data){
      Verify.verifySocketUser(data.token,function(procced){
        if(procced){
                activityController.insertInterest(data.userId,data.postId,data.interest);
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });

//update inters
    socket.on('interestUpdate',function(data){
      Verify.verifySocketUser(data.token,function(procced){
        if(procced){
                activityController.updateInterest(data.userId,data.postId,data.interest);
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });

//delete interest
    socket.on('interestDelete',function(data){
      Verify.verifySocketUser(data.token,function(procced){
        if(procced){
                activityController.deleteInterest(data.userId,data.postId);
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });


    socket.on('NewComment',function(data){
      Verify.verifySocketUser(data.token,function(procced){
        if(procced){
                activityController.insertComment(data.userId,data.postId,data.comment,function(msg){
                    return io.to(socket.id).emit("ReplyComment",msg);
                });
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });



    socket.on('reportPost',function(data){
      Verify.verifySocketUser(data.token,function(procced){
        if(procced){
                activityController.reportPost(data.userId,data.postId,data.reason,function(msg){
                    return io.to(socket.id).emit("ReplyReport",msg);
                });
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });

//recent activty

  
      socket.on('recentActivity',function(data){
      Verify.verifySocketUser(data.token,function(procced){
        if(procced){
                notificationController.getRecentActivity(data.userId,function(activty){
                    return io.to(socket.id).emit("ReplyActivity",activty);
                });
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });

      socket.on('ReportedPost',function(data){
        console.log("in here");
      Verify.verifyAdmin(data.token,data.userId,function(procced){
        if(procced){
                adminController.gatherReports(function(err,allpost,allusers){
                    return io.to(socket.id).emit("ReplyReportedPost",{'blogs':allpost,'users':allusers});
                });
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });


      socket.on('UnblockUser',function(data){
      Verify.verifyAdmin(data.token,data.userId,function(procced){
        if(procced){
                adminController.unblockUser(data.buserId,function(err){
  
                });
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });

      socket.on('BlockUser',function(data){
        console.log("From activity.blockUser");
      Verify.verifyAdmin(data.token,data.userId,function(procced){
        if(procced){
                adminController.blockUser(data.buserId,function(err){
                    
                });
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });

      socket.on('RemoveBlog',function(data){
      Verify.verifyAdmin(data.token,data.userId,function(procced){
        if(procced){
                adminController.removeBlog(data.postId,function(){
                   
                });
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });


// notification


      socket.on('OnlineNotification',function(data){
      Verify.verifySocketUser(data.token,function(procced){
        if(procced){
                notificationController.getOnlineNotify(data.userId,function(notify){
                    return io.to(socket.id).emit("ReplyNotification",notify);
                });
              }
        else
        {
          return io.to(socket.id).emit("AuthorizationFailed","Authorization Failed");
        }
      });
    });



   	socket.on('disconnect', function () {
    console.log('A user disconnected');
  });

}