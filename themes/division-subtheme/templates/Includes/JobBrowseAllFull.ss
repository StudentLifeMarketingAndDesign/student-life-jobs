<section class="topicholder-section topicholder-section--gray"><div class="grid-container grid-container--wpadding"><div class="grid-x grid-padding-x"><div class="cell large-12"><h2 class="topicholder-section__heading">Browse all jobs by category</h2><ul class="topicholder-all-list"> <% loop $Categories.Sort('Title ASC') %> <li class="topicholder-all-list__item topicholder-all-list__item--avoid-break"><h3 class="topicholder-all-list__item-heading"><a href="$Link">$Title ({$ActiveJobListings})</a></h3></li> <% end_loop %> </ul></div></div></div></section> <%--
      <section class="topicholder-section topicholder-section--gray">
        <div class="grid-container grid-container--wpadding">
          <div class="grid-x grid-padding-x">

            <div class="cell medium-12">
                  <h2 class="topicholder-section__heading">Browse all jobs by department</h2>

                 <ul class="topicholder-all-list">
                   <% loop $Departments.Sort('Title ASC') %> <li class="topicholder-all-list__item topicholder-all-list__item--avoid-break"><h3 class="topicholder-all-list__item-heading"><a href="$Link">$Title</a></h3> <% if $JobListings %> <ul class="topicholder-sublist"> <% loop $JobListings.Sort('Title ASC') %> <li class="topicholder-sublist__item"><a href="$Link">$Title</a></li> <% end_loop %> </ul> <% end_if %> </li> <% end_loop %> --%>