<section class="topicholder-featured topicholder-section topicholder-section--light-gray"><div class="grid-container grid-container--wpadding"><div class="grid-x grid-padding-x"><div class="cell large-12"><h2 class="topicholder-section__heading">Recently updated jobs</h2><div class="grid-x grid-padding-x medium-up-2"> <% loop $JobListings.Limit(4).Sort('LastEdited DESC') %> <div class="cell"> <% include TopicCardSummary %> </div> <% end_loop %> </div></div></div></div></section>