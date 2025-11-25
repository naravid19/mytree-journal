export type Image = {
  id: number;
  image: string;
  thumbnail: string;
  uploaded_at: string;
};

export type Strain = {
  id: number;
  name: string;
  description: string;
};

export type Batch = {
  id: number;
  batch_code: string;
  description: string;
  started_date: string;
};

export type Tree = {
  id: number;
  nickname: string;
  strain: Strain | null;
  variety: string;
  batch: Batch | null;
  location: string;
  status: string;
  created_at: string;
  updated_at: string;
  germination_date: string;
  plant_date: string;
  growth_stage: string;
  harvest_date: string;
  sex: string;
  genotype: string;
  phenotype: string;
  parent_male: number | null;
  parent_female: number | null;
  parent_male_data?: { id: number; nickname: string } | null;
  parent_female_data?: { id: number; nickname: string } | null;
  clone_source: number | null;
  pollination_date: string;
  pollinated_by: number | null;
  yield_amount: number | null;
  flower_quality: string;
  seed_count: number | null;
  seed_harvest_date: string;
  disease_notes: string;
  document: string | null;
  images: Image[];
  notes: string;
  generation?: string;
};
