<?php

use SilverStripe\Forms\TextField;
use SilverStripe\Forms\HTMLEditor\HTMLEditorField;
use SilverStripe\Forms\FieldList;
use SilverStripe\Control\Controller;
use SilverStripe\Blog\Model\Blog;
use SilverStripe\Security\Permission;
use SilverStripe\ORM\DataObject;
use SilverStripe\Blog\Model\CategorisationObject;
use SilverStripe\ORM\ArrayList;

/**
 * A department for keyword descriptions of a job listing location.
 *
 * @package silverstripe
 * @subpackage blog
 *
 * @method Blog Blog()
 *
 * @property string $Title
 * @property string $URLSegment
 * @property int $BlogID
 */

class JobListingCategory extends JobListingCategorisationObject
{

    public function listingFeedURL(){
       return JOBFEED_BASE.'positions.json?category_id='.$this->ID;
    }
    public function Parent(){
        $holder = JobListingHolder::get()->First();
        //echo 'hello'
        return $holder;
    }
    /**
     * Returns a relative URL for the tag link.
     *
     * @return string

     */
    public function Link()
    {
        $holder = JobListingHolder::get()->First();
        return $holder->Link('category/'.$this->ID);
    }


    public static function getByID($id){
        //TODO: Request categories.json?id=xx from Mark P
        $holder = JobListingHolder::get()->First();
        $cats = $holder->Categories();

        foreach($cats as $cat){
            if($cat->ID == $id){
                return $cat;
            }
        }
    }


}
