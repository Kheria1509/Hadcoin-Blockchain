import { useState, useCallback } from 'react';

export function useBlockColors(initialColor: string) {
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map());

  const getBlockColor = useCallback((blockId: string): string => {
    return colorMap.get(blockId) || initialColor;
  }, [colorMap, initialColor]);

  const setBlockColor = useCallback((blockId: string, color: string) => {
    setColorMap(prev => new Map(prev.set(blockId, color)));
  }, []);

  const propagateColor = useCallback((parentId: string, depth: number, subdivisions: number) => {
    const color = getBlockColor(parentId);
    
    // Generate child block IDs and set their colors
    for (let x = 0; x < subdivisions; x++) {
      for (let y = 0; y < subdivisions; y++) {
        for (let z = 0; z < subdivisions; z++) {
          const childId = `${depth + 1}-${x}-${y}-${z}`;
          if (!colorMap.has(childId)) {
            setBlockColor(childId, color);
          }
        }
      }
    }
  }, [colorMap, getBlockColor, setBlockColor]);

  return {
    getBlockColor,
    setBlockColor,
    propagateColor
  };
} 