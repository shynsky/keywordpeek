/**
 * DataForSEO API Types
 * Based on the Keywords Data API and SERP API
 */

// =============================================================================
// Base Types
// =============================================================================

export interface DataForSEOResponse<T> {
  version: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  tasks_count: number;
  tasks_error: number;
  tasks: DataForSEOTask<T>[];
}

export interface DataForSEOTask<T> {
  id: string;
  status_code: number;
  status_message: string;
  time: string;
  cost: number;
  result_count: number;
  path: string[];
  data: Record<string, unknown>;
  result: T[] | null;
}

// =============================================================================
// Keywords Data API - Search Volume
// =============================================================================

export interface KeywordSearchVolumeRequest {
  keywords: string[];
  location_code?: number; // 2840 = United States
  language_code?: string; // "en"
  search_partners?: boolean;
  date_from?: string; // YYYY-MM-DD
  date_to?: string;
  include_serp_info?: boolean;
  include_clickstream_data?: boolean;
}

export interface KeywordSearchVolumeResult {
  keyword: string;
  location_code: number;
  language_code: string;
  search_partners: boolean;
  keyword_info: KeywordInfo;
  keyword_info_normalized_with_bing?: KeywordInfo;
  keyword_info_normalized_with_clickstream?: KeywordInfo;
  impressions_info?: ImpressionsInfo;
  serp_info?: SerpInfo;
  avg_backlinks_info?: AvgBacklinksInfo;
  search_intent_info?: SearchIntentInfo;
}

export interface KeywordInfo {
  se_type: string;
  last_updated_time: string;
  competition: number; // 0-1
  competition_level: "LOW" | "MEDIUM" | "HIGH";
  cpc: number;
  search_volume: number;
  low_top_of_page_bid: number;
  high_top_of_page_bid: number;
  categories: number[] | null;
  monthly_searches: MonthlySearch[];
}

export interface MonthlySearch {
  year: number;
  month: number;
  search_volume: number;
}

export interface ImpressionsInfo {
  se_type: string;
  last_updated_time: string;
  bid: number;
  match_type: string;
  ad_position_min: number;
  ad_position_max: number;
  ad_position_average: number;
  cpc_min: number;
  cpc_max: number;
  cpc_average: number;
  daily_impressions_min: number;
  daily_impressions_max: number;
  daily_impressions_average: number;
  daily_clicks_min: number;
  daily_clicks_max: number;
  daily_clicks_average: number;
  daily_cost_min: number;
  daily_cost_max: number;
  daily_cost_average: number;
}

export interface SerpInfo {
  se_type: string;
  check_url: string;
  serp_item_types: string[];
  se_results_count: number;
  last_updated_time: string;
  previous_updated_time: string;
}

export interface AvgBacklinksInfo {
  se_type: string;
  backlinks: number;
  dofollow: number;
  referring_pages: number;
  referring_domains: number;
  referring_main_domains: number;
  rank: number;
  main_domain_rank: number;
  last_updated_time: string;
}

export interface SearchIntentInfo {
  se_type: string;
  main_intent: "informational" | "navigational" | "commercial" | "transactional";
  foreign_intent: string[] | null;
  last_updated_time: string;
}

// =============================================================================
// Keywords Data API - Keywords for Keywords (Related)
// =============================================================================

export interface KeywordsForKeywordsRequest {
  keyword: string;
  location_code?: number;
  language_code?: string;
  include_serp_info?: boolean;
  include_clickstream_data?: boolean;
  include_seed_keyword?: boolean;
  limit?: number;
  offset?: number;
}

export interface KeywordsForKeywordsResult {
  keyword: string;
  location_code: number;
  language_code: string;
  keyword_info: KeywordInfo;
  serp_info?: SerpInfo;
  search_intent_info?: SearchIntentInfo;
}

// =============================================================================
// Keywords Data API - Google Suggest (Autocomplete)
// =============================================================================

export interface GoogleSuggestRequest {
  keyword: string;
  location_code?: number;
  language_code?: string;
  cursor_pointer?: number;
}

export interface GoogleSuggestResult {
  keyword: string;
  location_code: number;
  language_code: string;
  datetime: string;
  items: GoogleSuggestItem[];
}

export interface GoogleSuggestItem {
  type: string;
  suggestion: string;
  suggestion_type: string;
}

// =============================================================================
// SERP API - People Also Ask
// =============================================================================

export interface SerpPeopleAlsoAskRequest {
  keyword: string;
  location_code?: number;
  language_code?: string;
  device?: "desktop" | "mobile";
  os?: "windows" | "macos";
  depth?: number;
}

export interface SerpResult {
  keyword: string;
  type: string;
  se_domain: string;
  location_code: number;
  language_code: string;
  check_url: string;
  datetime: string;
  spell?: SpellInfo;
  refinement_chips?: RefinementChip;
  item_types: string[];
  se_results_count: number;
  items_count: number;
  items: SerpItem[];
}

export interface SpellInfo {
  keyword: string;
  type: string;
}

export interface RefinementChip {
  items: RefinementChipItem[];
}

export interface RefinementChipItem {
  type: string;
  title: string;
  url: string;
  domain: string;
  options: RefinementOption[];
}

export interface RefinementOption {
  type: string;
  title: string;
  url: string;
}

export type SerpItem =
  | OrganicSerpItem
  | PeopleAlsoAskItem
  | FeaturedSnippetItem
  | RelatedSearchesItem;

export interface BaseSerpItem {
  type: string;
  rank_group: number;
  rank_absolute: number;
  position: string;
  xpath: string;
}

export interface OrganicSerpItem extends BaseSerpItem {
  type: "organic";
  domain: string;
  title: string;
  url: string;
  description: string;
  breadcrumb: string;
  is_image: boolean;
  is_video: boolean;
  is_featured_snippet: boolean;
  is_malicious: boolean;
  is_web_story: boolean;
  links?: SerpLink[];
}

export interface SerpLink {
  type: string;
  title: string;
  url: string;
  description?: string;
}

export interface PeopleAlsoAskItem extends BaseSerpItem {
  type: "people_also_ask";
  title: string;
  url: string;
  domain: string;
  featured_title: string;
  description: string;
  items?: PeopleAlsoAskExpandedItem[];
}

export interface PeopleAlsoAskExpandedItem {
  type: string;
  title: string;
  url: string;
  domain: string;
  description: string;
}

export interface FeaturedSnippetItem extends BaseSerpItem {
  type: "featured_snippet";
  domain: string;
  title: string;
  url: string;
  description: string;
  featured_title: string;
}

export interface RelatedSearchesItem extends BaseSerpItem {
  type: "related_searches";
  items: RelatedSearchItem[];
}

export interface RelatedSearchItem {
  type: string;
  title: string;
  url: string;
}

// =============================================================================
// DataForSEO Labs API Types
// =============================================================================

export interface LabsHistoricalSearchVolumeRequest {
  keywords: string[];
  location_code?: number;
  language_code?: string;
  include_serp_info?: boolean;
  include_clickstream_data?: boolean;
}

export interface LabsHistoricalSearchVolumeResult {
  keyword: string;
  location_code: number;
  language_code: string;
  keyword_info: LabsKeywordInfo;
  keyword_info_normalized_with_bing?: LabsKeywordInfo;
  keyword_info_normalized_with_clickstream?: LabsKeywordInfo;
  serp_info?: SerpInfo;
  avg_backlinks_info?: AvgBacklinksInfo;
  search_intent_info?: SearchIntentInfo;
  keyword_properties?: KeywordProperties;
}

export interface LabsKeywordInfo {
  se_type: string;
  last_updated_time: string;
  competition: number;
  competition_level: "LOW" | "MEDIUM" | "HIGH";
  cpc: number;
  search_volume: number;
  low_top_of_page_bid: number;
  high_top_of_page_bid: number;
  categories: number[] | null;
  monthly_searches: MonthlySearch[];
}

export interface KeywordProperties {
  se_type: string;
  core_keyword: string | null;
  synonym_clustering_algorithm: string | null;
  keyword_difficulty: number;
  detected_language: string;
  is_another_language: boolean;
}

export interface LabsRelatedKeywordsRequest {
  keyword: string;
  location_code?: number;
  language_code?: string;
  include_serp_info?: boolean;
  include_clickstream_data?: boolean;
  include_seed_keyword?: boolean;
  limit?: number;
  depth?: number;
}

export interface LabsRelatedKeywordsResult {
  se_type: string;
  seed_keyword: string;
  seed_keyword_data: LabsKeywordData | null;
  location_code: number;
  language_code: string;
  total_count: number;
  items_count: number;
  items: LabsRelatedKeywordItem[];
}

export interface LabsKeywordData {
  keyword: string;
  keyword_info: LabsKeywordInfo;
  keyword_info_normalized_with_bing?: LabsKeywordInfo;
  keyword_info_normalized_with_clickstream?: LabsKeywordInfo;
  serp_info?: SerpInfo;
  avg_backlinks_info?: AvgBacklinksInfo;
  search_intent_info?: SearchIntentInfo;
  keyword_properties?: KeywordProperties;
}

export interface LabsRelatedKeywordItem {
  se_type: string;
  keyword_data: LabsKeywordData;
  depth: number;
  related_keywords: string[] | null;
}

// =============================================================================
// KeywordPeek Internal Types
// =============================================================================

/**
 * Normalized keyword result for frontend consumption
 */
export interface KeywordResult {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: "low" | "medium" | "high";
  competitionScore: number; // 0-1
  difficulty: number; // 0-100 (calculated)
  keywordScore: number; // 0-100 (opportunity score)
  intent: "informational" | "navigational" | "commercial" | "transactional" | null;
  trend: MonthlyTrend[];
  locationCode: number;
  languageCode: string;
}

export interface MonthlyTrend {
  year: number;
  month: number;
  volume: number;
}

/**
 * Extended keyword result with suggestions and questions
 */
export interface KeywordResultExtended extends KeywordResult {
  suggestions?: string[];
  questions?: string[];
  autocomplete?: string[];
  relatedSearches?: string[];
}

/**
 * Bulk keyword check result (lighter weight)
 */
export interface KeywordBulkResult {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  keywordScore: number;
}

/**
 * Error response from DataForSEO
 */
export interface DataForSEOError {
  code: number;
  message: string;
  data?: Record<string, unknown>;
}
