export interface LocationDetail {
  id: number;
  name: string;
  slug: string;
  city: string;
  zone: string;
  lat: number;
  lng: number;
  base_price_sqft: number;
  rental_yield: number;
  demand_index: number;
  supply_index: number;
  selling_days: number;
  price_growth_1y: number;
  flood_risk_score: number;
  infra_score: number;
  water_table_risk?: number;
  risk_score?: number;
  risk_level?: string;
  opportunity_score?: number;
  opportunity_grade?: string;
  anomaly_signal?: string;
  market_status?: 'EXPANDING' | 'STABLE' | 'COOLING' | 'STRESSED' | string;
  summary?: string;
}

export interface EarlyWarningAlert {
  id: number;
  location_id: number;
  location_name: string;
  location_slug: string;
  severity: 'INFO' | 'WATCH' | 'WARNING' | 'HIGH' | 'CRITICAL';
  title: string;
  signal_type: string;
  signals: Array<{
    indicator: string;
    previous: number;
    current: number;
    change_pct: number;
    direction: 'UP' | 'DOWN';
  }>;
  interpretation: string;
  recommended_action: string;
  data_sources: string[];
  timestamp: string;
}

export interface DashboardKPISummary {
  avg_property_price_sqft: number;
  avg_price_growth_yoy: number;
  market_demand_index: number;
  inventory_supply_index: number;
  composite_market_risk: number;
  avg_rental_yield_pct: number;
  market_liquidity_score: number;
  projected_12m_metro_growth: number;
  market_pulse_state: 'EXPANDING' | 'STABLE' | 'COOLING' | 'STRESSED';
  market_pulse_summary: string;
}

export interface DashboardData {
  kpi_summary: DashboardKPISummary;
  ai_market_memo: string;
  micro_markets: LocationDetail[];
  historical_trends: Array<{
    quarter: string;
    avg_price_sqft: number;
    demand_index: number;
    supply_index: number;
    selling_days: number;
    rental_yield: number;
  }>;
  early_warning_alerts: EarlyWarningAlert[];
  top_opportunities: LocationDetail[];
  high_risk_locations: LocationDetail[];
  recent_analyses: Array<{
    id: number;
    title: string;
    location_name: string;
    property_type: string;
    area_sqft: number;
    fair_value_total: number;
    current_price: number;
    listed_date: string;
  }>;
  data_freshness: {
    official_sources: string[];
    status: string;
  };
}

export type DashboardOverview = DashboardData;

export interface FeatureExplanation {
  factor: string;
  impact_inr: number;
  impact_pct: number;
  category: string;
  description: string;
}

export interface PropertyAnalysisResponse {
  input_summary: {
    locality: string;
    city: string;
    property_type: string;
    area_sqft: number;
    bedrooms: number;
    bathrooms: number;
    property_age: number;
    floor_number: number;
    total_floors: number;
    current_price: number;
    amenities_count: number;
  };
  valuation: {
    estimated_value: number;
    lower_bound: number;
    upper_bound: number;
    estimated_price_sqft: number;
    valuation_status: 'UNDERVALUED' | 'FAIR_VALUE' | 'OVERVALUED';
    over_under_pct: number;
  };
  forecast: {
    '3_month': number;
    '6_month': number;
    '12_month': number;
    growth_12m_pct: number;
  };
  risk: {
    score: number;
    level: 'VERY_LOW' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
    dimensions: {
      market_risk: number;
      valuation_risk: number;
      demand_risk: number;
      supply_risk: number;
      liquidity_risk: number;
      environmental_risk: number;
      infrastructure_risk: number;
      economic_risk: number;
    };
    key_vulnerabilities: string[];
    mitigating_factors: string[];
  };
  demand: {
    score: number;
    trend: 'INCREASING' | 'STABLE' | 'DECLINING';
    demand_supply_ratio: number;
    description: string;
  };
  liquidity: {
    score: number;
    classification: string;
    estimated_selling_days: number;
    turnover_velocity: string;
  };
  opportunity: {
    score: number;
    grade: string;
    growth_potential: string;
    drivers: string[];
  };
  rental_potential: {
    gross_rental_yield_pct: number;
    estimated_monthly_rent_inr: number;
    annual_rental_cashflow_inr: number;
    tenant_demand_rating: string;
    primary_occupant_segment: string;
  };
  recommendation: {
    decision: 'BUY' | 'WAIT' | 'AVOID' | 'HOLD';
    confidence: number;
    rationale: string;
    key_tradeoffs: string[];
    suggested_negotiation_range?: {
      recommended_bid_inr: number;
      discount_target_pct: number;
    };
  };
  explanations: {
    positive_factors: FeatureExplanation[];
    negative_factors: FeatureExplanation[];
    net_amenity_adjustment_pct: number;
  };
  micro_market: LocationDetail;
  data_freshness: {
    dataset: string;
    last_updated: string;
    source_authority: string;
    data_type: string;
  };
  model_provenance: {
    model_name: string;
    version: string;
    r2_score: number;
    data_source: string;
  };
}

export interface ScenarioSimulationResponse {
  location_name: string;
  applied_shocks: {
    demand_change_pct: number;
    supply_change_pct: number;
    interest_rate_change_bps: number;
    infra_improvement_pct: number;
    environmental_stress_delta: number;
    rental_growth_delta_pct: number;
  };
  base_case: any;
  scenario_case: any;
  comparison_matrix: Array<{
    metric: string;
    base_value: string;
    scenario_value: string;
    delta: string;
    unit: string;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }>;
  decision_shift: {
    base_decision: string;
    scenario_decision: string;
    has_changed: boolean;
    summary: string;
  };
  ai_scenario_synthesis: string;
}

export interface AIAnalystResponse {
  answer: string;
  why: string;
  data: Record<string, any>;
  risks: string[];
  recommendation: string;
  confidence: number;
  data_freshness: string;
  cited_sources: string[];
}
