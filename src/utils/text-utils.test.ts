import { extractQuestionIds, replaceQuestionTagsWithMarkers } from './text-utils';

// Simple test function
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}: ${error}`);
  }
}

// Simple assertion function
function assertEqual(actual: any, expected: any, message: string = "") {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}. ${message}`);
  }
}

// Test extractQuestionIds
test('extractQuestionIds should extract question IDs from content with question tags', () => {
  const content = 'Some text [question:123e4567-e89b-12d3-a456-426614174000] more text [question:abcdef12-3456-7890-abcd-ef1234567890]';
  const expected: string[] = [
    '123e4567-e89b-12d3-a456-426614174000',
    'abcdef12-3456-7890-abcd-ef1234567890'
  ];
  
  const result = extractQuestionIds(content);
  
  assertEqual(result, expected);
});

test('extractQuestionIds should return empty array when no question tags are found', () => {
  const content = 'Some text without question tags';
  const expected: string[] = [];
  
  const result = extractQuestionIds(content);
  
  assertEqual(result, expected);
});

test('extractQuestionIds should handle empty content', () => {
  const expected: string[] = [];
  
  const result = extractQuestionIds('');
  
  assertEqual(result, expected);
});

// Test replaceQuestionTagsWithMarkers
test('replaceQuestionTagsWithMarkers should replace question tags with markers', () => {
  const content = 'Some text [question:123e4567-e89b-12d3-a456-426614174000] more text';
  const expected = 'Some text <div class="question-marker" data-question-id="123e4567-e89b-12d3-a456-426614174000"></div> more text';
  
  const result = replaceQuestionTagsWithMarkers(content);
  
  assertEqual(result, expected);
});

test('replaceQuestionTagsWithMarkers should handle multiple question tags', () => {
  const content = 'Text [question:123] more [question:456] end';
  const expected = 'Text <div class="question-marker" data-question-id="123"></div> more <div class="question-marker" data-question-id="456"></div> end';
  
  const result = replaceQuestionTagsWithMarkers(content);
  
  assertEqual(result, expected);
});

test('replaceQuestionTagsWithMarkers should handle content without question tags', () => {
  const content = 'Text without tags';
  const expected = 'Text without tags';
  
  const result = replaceQuestionTagsWithMarkers(content);
  
  assertEqual(result, expected);
});

console.log('All tests completed!');