import * as React from 'react';
import { Link, useSearchParams  } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';
import type { IExecution } from '@automatisch/types';

import ExecutionRow from 'components/ExecutionRow';
import Container from 'components/Container';
import PageTitle from 'components/PageTitle';
import useFormatMessage from 'hooks/useFormatMessage'
import { GET_EXECUTIONS } from 'graphql/queries/get-executions';

const EXECUTION_PER_PAGE = 10;

const getLimitAndOffset = (page: number) => ({
  limit: EXECUTION_PER_PAGE,
  offset: (page - 1) * EXECUTION_PER_PAGE,
});

export default function Executions(): React.ReactElement {
  const formatMessage = useFormatMessage();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '', 10) || 1;

  const { data, refetch } = useQuery(GET_EXECUTIONS, {
    variables: getLimitAndOffset(page),
    fetchPolicy: 'cache-and-network',
    pollInterval: 5000,
  });
  const getExecutions = data?.getExecutions || {};
  const { pageInfo, edges } = getExecutions;

  React.useEffect(() => {
    refetch(getLimitAndOffset(page));
  }, [refetch, page])

  const executions: IExecution[] = edges?.map(({ node }: { node: IExecution }) => node);

  return (
    <Box sx={{ py: 3 }}>
      <Container>
        <Grid container sx={{ mb: [2, 5] }} columnSpacing={1.5} rowSpacing={3}>
          <Grid container item xs sm alignItems="center" order={{ xs: 0 }}>
            <PageTitle>{formatMessage('executions.title')}</PageTitle>
          </Grid>
        </Grid>

        {executions?.map((execution) => (<ExecutionRow key={execution.id} execution={execution} />))}

        {pageInfo && pageInfo.totalPages > 1 && <Pagination
          sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}
          page={pageInfo?.currentPage}
          count={pageInfo?.totalPages}
          onChange={(event, page) => setSearchParams({ page: page.toString() })}
          renderItem={(item) => (
            <PaginationItem
              component={Link}
              to={`${item.page === 1 ? '' : `?page=${item.page}`}`}
              {...item}
            />
          )}
        />}
      </Container>
    </Box>
  );
};
