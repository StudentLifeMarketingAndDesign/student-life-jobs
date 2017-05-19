$Header
<main class="main-content__container" id="main-content__container">

  <!-- Background Image Feature -->
  <% if $BackgroundImage %>
    <% include FeaturedImage %>
  <% end_if %>
  $Breadcrumbs

<% if not $BackgroundImage %>
  <div class="column row">
    <div class="main-content__header">
      <h1>$Title</h1>
    </div>
  </div>
<% end_if %>

$BlockArea(BeforeContent)

<div class="row">

  <article role="main" class="main-content main-content--with-padding <% if $Children || $Menu(2) || $SidebarBlocks ||  $SidebarView.Widgets %>main-content--with-sidebar<% else %>main-content--full-width<% end_if %>">
    $BlockArea(BeforeContentConstrained)
    <div class="main-content__text">
        <% if $Query %>
          <h2>Search results for "<em>{$Query}</em>"</h2>
          <% if $Results %>
          <ul class="job-list">
              <% loop $Results %>
                <li class="job-list__item">
                  <h3><i class="fa fa-file"></i> <a href="$Link">$Title</a></h3>

                </li>
              <% end_loop %>
          </ul>
          <% else %>
            <p>No results found for "<em>{$Query}</em>."</p>
          <% end_if %>
        <% else %>
          <p>No search term specified, please type one in below:</p>
        <% end_if %>
        <hr />
        <% with $SearchForm %>
        <% include TopicSearchForm %>
        <% end_with %>

        <% include JobListingHolderAllTopics %>
    </div>
    $BlockArea(AfterContentConstrained)
    $Form
    <% if $ShowChildPages %>
      <% include ChildPages %>
    <% end_if %>
  </article>
  <aside class="sidebar">
    <% include SideNav %>
    <% if $SideBarView %>
      $SideBarView
    <% end_if %>
    $BlockArea(Sidebar)
  </aside>
</div>
$BlockArea(AfterContent)

</main>
