from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response

class CustomPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'limit'
    max_page_size = 100

    def get_paginated_response(self, data):
        return Response({
            'listings': data,
            'total': self.page.paginator.count,
            'page': self.page.number,
            'total_pages': self.page.paginator.num_pages
        })
