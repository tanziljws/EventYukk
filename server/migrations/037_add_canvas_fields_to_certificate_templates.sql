-- Migration: Add canvas-based fields to certificate_templates table
-- Date: 2025-01-XX
-- Description: Add backgroundImage, backgroundSize, and elements (JSON) for canvas-based certificate editor

-- Add backgroundImage column (TEXT to store base64 or URL)
ALTER TABLE certificate_templates 
ADD COLUMN backgroundImage TEXT NULL AFTER accent_color;

-- Add backgroundSize column
ALTER TABLE certificate_templates 
ADD COLUMN backgroundSize ENUM('contain', 'cover', 'stretch') DEFAULT 'cover' AFTER backgroundImage;

-- Add elements column (JSON to store array of elements)
ALTER TABLE certificate_templates 
ADD COLUMN elements JSON NULL AFTER backgroundSize;

-- Update existing templates to have default values
UPDATE certificate_templates 
SET backgroundSize = 'cover' 
WHERE backgroundSize IS NULL;

