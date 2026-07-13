interface ListLoadingState {
  // No data yet at all — block the content area with a full spinner.
  showFullLoader: boolean;
  // Data already on screen from a previous fetch — keep it visible and show
  // a small inline indicator instead of wiping the list every time a filter
  // or page change re-triggers the request.
  showInlineLoader: boolean;
}

export function useListLoadingState(loading: boolean, count: number): ListLoadingState {
  return {
    showFullLoader: loading && count === 0,
    showInlineLoader: loading && count > 0,
  };
}
