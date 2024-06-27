interface TweetResult {
  raw: Raw;
  cursor: Cursor;
  data: DataItem[];
}
interface Raw {
  instruction?: InstructionItem[];
  entry?: EntryItem[];
  result?: Result;
}
interface InstructionItem {
  type: string;
  entries?: EntriesItem[];
}
interface EntriesItem {
  content: Content;
  entryId: string;
  sortIndex: string;
}
interface Content {
  typename: string;
  clientEventInfo?: ClientEventInfo;
  entryType: string;
  itemContent?: ItemContent;
  displayType?: string;
  footer?: Footer;
  header?: Header;
  items?: ItemsItem[];
  cursorType?: string;
  value?: string;
}
interface ClientEventInfo {
  component: string;
  details: Details;
  element?: string;
}
interface Details {
  timelinesDetails: TimelinesDetails;
}
interface TimelinesDetails {
  injectionType: string;
  controllerData: string;
  sourceData?: string;
}
interface ItemContent {
  typename: string;
  itemType: string;
  tweetDisplayType?: string;
  tweetResults?: TweetResults;
  userDisplayType?: string;
  userResults?: UserResults;
}
interface TweetResults {
  result: Result;
}
interface Result {
  typename?: string;
  core?: Core;
  editControl?: EditControl;
  isTranslatable?: boolean;
  legacy: Legacy;
  restId?: string;
  source?: string;
  unmentionData?: UnmentionData;
  views?: Views;
  affiliatesHighlightedLabel?: AffiliatesHighlightedLabel;
  hasGraduatedAccess?: boolean;
  id?: string;
  isBlueVerified?: boolean;
  profileImageShape?: string;
  professional?: Professional;
  __typename?: string;
  rest_id?: string;
}
interface Core {
  userResults: UserResults;
}
interface UserResults {
  result: Result;
}
interface AffiliatesHighlightedLabel {
  label?: Label;
}
interface Legacy {
  canDm?: boolean;
  canMediaTag?: boolean;
  createdAt?: string;
  defaultProfile?: boolean;
  defaultProfileImage?: boolean;
  description?: string;
  entities?: Entities;
  fastFollowersCount?: number;
  favouritesCount?: number;
  followersCount?: number;
  friendsCount?: number;
  hasCustomTimelines?: boolean;
  isTranslator?: boolean;
  listedCount?: number;
  location?: string;
  mediaCount?: number;
  name?: string;
  normalFollowersCount?: number;
  pinnedTweetIdsStr?: string[];
  possiblySensitive?: boolean;
  profileImageUrlHttps?: string;
  profileInterstitialType?: string;
  screenName?: string;
  statusesCount?: number;
  translatorType?: string;
  verified?: boolean;
  wantRetweets?: boolean;
  withheldInCountries?: any[];
  bookmarkCount?: number;
  bookmarked?: boolean;
  conversationIdStr?: string;
  displayTextRange?: number[];
  favoriteCount?: number;
  favorited?: boolean;
  fullText?: string;
  idStr?: string;
  isQuoteStatus?: boolean;
  lang?: string;
  quoteCount?: number;
  replyCount?: number;
  retweetCount?: number;
  retweeted?: boolean;
  userIdStr?: string;
  profileBannerUrl?: string;
  url?: string;
  verifiedType?: string;
  screen_name?: string;
}
interface Entities {
  description?: Description;
  hashtags?: any[];
  symbols?: any[];
  timestamps?: any[];
  urls?: any[];
  userMentions?: any[];
  url?: Url;
}
interface Description {
  urls: any[];
}
interface EditControl {
  editTweetIds: string[];
  editableUntilMsecs: string;
  editsRemaining: string;
  isEditEligible: boolean;
}
interface UnmentionData {}
interface Views {
  state: string;
  count?: string;
}
interface Footer {
  displayType: string;
  text: string;
  landingUrl: LandingUrl;
}
interface LandingUrl {
  url: string;
  urlType: string;
}
interface Header {
  displayType: string;
  text: string;
  sticky: boolean;
}
interface ItemsItem {
  entryId: string;
  item: Item;
}
interface Item {
  clientEventInfo: ClientEventInfo;
  itemContent: ItemContent;
}
interface Url {
  urls: UrlsItem[];
}
interface UrlsItem {
  display_url: string;
  expanded_url: string;
  url: string;
  indices: number[];
}
interface Professional {
  category: CategoryItem[];
  professionalType: string;
  restId: string;
}
interface Label {
  badge: Badge;
  description: string;
  longDescription: LongDescription;
  userLabelType: string;
}
interface Badge {
  url: string;
}
interface LongDescription {
  text: string;
  entities: EntitiesItem[];
}
interface EntitiesItem {
  fromIndex: number;
  toIndex: number;
  ref: Ref;
}
interface Ref {
  type: string;
  screen_name: string;
  mention_results: Mention_results;
}
interface Mention_results {
  result: Result;
}
interface CategoryItem {
  iconName: string;
  id: number;
  name: string;
}
interface EntryItem {
  content: Content;
  entryId: string;
  sortIndex: string;
}
interface Cursor {
  top: Top;
  bottom: Bottom;
}
interface Top {
  typename: string;
  cursorType: string;
  entryType: string;
  value: string;
}
interface Bottom {
  typename: string;
  cursorType: string;
  entryType: string;
  value: string;
}
interface DataItem {
  raw: Raw;
  tweet: Tweet;
  user: User;
  replies: any[];
}
interface Tweet {
  typename: string;
  core: Core;
  editControl: EditControl;
  isTranslatable: boolean;
  legacy: Legacy;
  restId: string;
  source: string;
  unmentionData: UnmentionData;
  views: Views;
}
interface User {
  typename: string;
  affiliatesHighlightedLabel: AffiliatesHighlightedLabel;
  hasGraduatedAccess: boolean;
  id: string;
  isBlueVerified: boolean;
  legacy: Legacy;
  profileImageShape: string;
  restId: string;
}
