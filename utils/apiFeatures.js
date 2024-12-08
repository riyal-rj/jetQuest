class APIFeatures
{
    constructor(query,queryString)
    {
        this.query=query;
        this.queryString=queryString;
    }
    filter()
    {
        // 1) Simple filtering
        const queryObj={ ...this.queryString };
        const excludeFields=['page','sort','limit','fields'];
        excludeFields.forEach(el=>delete queryObj[el]);

        // 1.2) Advanced Filtering
        let queryStr=JSON.stringify(queryObj);
        queryStr=queryStr.replace(/\b(gte|gt|lte|lt)\b/g,match=>`$${match}`);

        this.query=this.query.find(JSON.parse(queryStr));
        return this;
    }
    sort()
    {
        if(this.queryString.sort)
        {  
            const sortBy=this.queryString.sort.split(',').join(' ');
            //for sorting for muktiple cols ---> sort('price ratingsAverage');
            this.query=this.query.sort(sortBy);
        }
        else
        {
            this.query=this.query.sort('-createdAt');
        }
        return this;
    }
    projectionofFields()
    {
        if(this.queryString.fields)
        {
            const fields=this.queryString.fields.split(',').join(' ');
            this.query=this.query.select(fields);
        }
        else
        {
            this.query=this.query.select('-__v');
        }
        return this;
    }
    pageinate()
    {
        const goToPage=this.queryString.page*1||1;
        const limitDocs=this.queryString.limit*1||100;
        const skipDocs=(goToPage-1)*(limitDocs);

        this.query=this.query.skip(skipDocs).limit(limitDocs);
        return this;
    }
}
module.exports=APIFeatures;