$Header
<main class="main-content__container" id="main-content__container">

  <!-- Background Image Feature -->
  <% if $BackgroundImage %>
    <div class="background-image" data-interchange="[$BackgroundImage.CroppedFocusedImage(600,400).URL, small], [$BackgroundImage.CroppedFocusedImage(1600,500).URL, medium]">
      <%-- <% if $LayoutType == "MainImage" %> --%>
        <div class="column row">
          <div class="background-image__header background-image__header--has-content">
            <h1 class="background-image__title text-center">$Title</h1>
            <div class="topic-search__container row">
              <div class="large-9 columns large-centered">
                <h2 class="text-center">Search for a job below:</h2>
                $SearchForm
              </div>
            </div>           
          </div>
        </div>
      <%-- <% end_if %> --%>
    </div>
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
      $Content
    </div>
      <% if $CurrentTag %>
        <% with $CurrentTag %>
          <h2>Jobs tagged with "<em>$Title</em>":</h2>
            <ul>
            <% loop $PaginatedList %>
              <li>
                <h3><i class="fa fa-file-o fa-lg fa-fw" aria-hidden="true"></i><a href="$Link">$Title</a></h3>
                <p>$Content.LimitCharacters(100)</p>
              </li>
            <% end_loop %>
            </ul>
        <% end_with %>
        <hr />
      <% else_if $CurrentCategory %>
        <% with $CurrentCategory %>
          $Image
          <h2>$Title</h2>
          $Content
          <h4>Jobs listed under {$Title}: </h4>
           <% if $BlogPosts %>
              <ul class="fa-ul"> 
                <% loop $BlogPosts %>
                  <li><i class="fa-li fa fa-file" aria-hidden="true"></i><a href="$Link">$Title</a></li>
                <% end_loop %>
              </ul>
            <% else %>
              <p>No jobs are currently listed.</p>
          <% end_if %>           
        <% end_with %>
      <% else_if $CurrentDepartment %>
        <% with $CurrentDepartment %>
          $Image
          <h2>$Title</h2>
          $Content
          <h4>Jobs listed under {$Title}: </h4>
           <% if $JobListings %>
              <ul class="fa-ul"> 
                <% loop $JobListings %>
                  <li><i class="fa-li fa fa-file" aria-hidden="true"></i><a href="$Link">$Title</a></li>
                <% end_loop %>
              </ul>
            <% else %>
              <p>No jobs are currently listed.</p>
          <% end_if %>           
        <% end_with %>
      <% end_if %>

      <% if not $BackgroundImage %>
        <div class="topic-search__container row">
          <div class="large-9 columns large-centered">
            <h2 class="text-center">Search for a job below:</h2>
            $SearchForm
          </div>
        </div>
       <hr />
      <% end_if %>
     
      <% include JobListingHolderAllTopics %>
      <hr />
      <% include JobListingHolderFeaturedTopics %>
    $BlockArea(AfterContentConstrained)
    $Form
    <% if $ShowChildPages %>
      <% include ChildPages %>
    <% end_if %>
  </article>
  <aside class="sidebar dp-sticky">
    <% include SideNav %>
    <% if $SideBarView %>
      $SideBarView
    <% end_if %>
    $BlockArea(Sidebar)
  </aside>
</div>
$BlockArea(AfterContent)

</main>