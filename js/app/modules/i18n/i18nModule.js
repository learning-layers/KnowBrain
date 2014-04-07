/**
 * Copyright 2014 Graz University of Technology - KTI (Knowledge Technologies Institute)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
// Encoding: UTF-8
/**
* INTERNATIONALISATION MODULE
*/

'use strict';

angular.module('module.i18n',[]);

angular.module('module.i18n').constant('I18N_MESSAGES', {
  // general
  username: 'username',
  password: 'password',

  upload: 'upload',
  create: 'create',
  cancle: 'cancel',
  back: 'back',
  add: 'add',
  private: 'private',
  shared: 'shared',
  or: 'or',
  folder: 'folder',
  unknown: 'unknown',
  ok: 'ok',
  posted: 'posted',
  input_empty: 'this field cannot be left blank',
  enter_comment: 'enter a comment',
  location: 'Location',
  allowed_chars: 'Allowed characters: ',
  privateSpace: 'private',
  sharedSpace: 'shared',
  follingSpace: 'following',

  // login
  remember_me: 'keep me logged in',
  login: 'login',
  incorrect_login: 'Incorrect Password or Username!',
  login_text: 'KB - Login',
  login_server_problem: 'There seems to be a problem with the server. Pleas try again, or contact the admin.',

  // app
  search: 'search',
  logout: 'logout from KnowBrain',
  config: 'configuration',
  root_collection: 'root collection',

  //add resource wizzard
  add_resource_info: 'What type of content do you want to add?',
  add_resource_info_subline: 'Please select a category below.',
  label_placeholder: 'Please enter a label',

  //upload
  upload_tooltip: 'Create content for this collection',
  upload_wizzard_title: 'Create content for the collection',
  close: 'close',
  upload_resource: 'Upload resource(s)',
  create_collection: 'Create a collection',
  add_link: 'Add a Link',
  upload_label: 'Select files...',
  drag_and_drop: 'Drag & Drop',
  drag_and_drop_subline: 'files here...',
  upload_resource_info: 'Upload resource(s)',
  upload_resource_info_subline_part1: 'by drag & drop  or',
  upload_resource_info_subline_part2: 'selecting with the system dialog:',
  upload_all: 'upload all',
  clear_file_list: 'clear file list',
  file_s: 'file(s)',
  filename: 'filename:',
  hundret_p_complete: '100% complete',
  open: 'open',
  foldername: 'foldername',
  no_folders_allowed: 'It is not allowed to upload folders.',
  entry_will_be_skipped: 'Entry will be skipped.',
  file_type: 'Type:',
  file_size: 'File size:',

  //collection
  collection_label: 'Collection label:',
  private_info: 'only me',
  shared_info: 'can be shared with other users',
  collection_is:' Collection is:',
  tagCloud: 'Cumulated tag cloud:',
  create_collection_inside_shared: 'A collection inside a shared collection will always be shared as well!',
  no_cumulated_tags: 'No tags for this collection',

  //collection context menu
  move_resource: 'Move resource',
  delete_resource: 'Delete resource',
  share_resource: 'Share resource',
  share: 'share with community',

  //collection detail
  label_empty: 'Label Can\'t be empty',

  //link
  link_label: 'Link label:',
  link_url: 'Url:',
  url_placeholder: 'Example: http://know-center.tugraz.at/',
  link_is: 'Link is:',
  follow_link: 'Follow link',

  //entity detail
  download_resource: 'Download resource',
  update_resource: 'Update resource',
  download_as: 'Download as:',
  download: 'download',
  downloading: 'downloading',
  read_only: 'Read only',
  write: 'Write',
  add_a_tag: 'add a tag',

  //search
  found_by_tag_search:'found by tag search:',
  found_by_content_search: 'found by content search:'

});

angular.module('module.i18n').service('i18nService', ['I18N_MESSAGES', function(I18N_MESSAGES) {

  this.t = function(identifier) {
    if(I18N_MESSAGES[identifier] !== null && I18N_MESSAGES[identifier] != '')
    {
      return I18N_MESSAGES[identifier];
    }
  };

}]);