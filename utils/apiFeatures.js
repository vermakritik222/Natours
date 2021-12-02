class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1)  FLITRING

        const quieryObj = { ...this.queryString };

        // console.log(`quieryObj ${quieryObj}`);

        const excludedFildes = ['page', 'sort', 'limit', 'fields'];

        excludedFildes.forEach((el) => delete quieryObj[el]);

        // 2) ADVANCE FLTRING

        let queryStr = JSON.stringify(quieryObj);

        queryStr = queryStr.replace(
            /\b(gte|gt|lte|lt)\b/g,
            (match) => `$${match}`
        );

        this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort() {
        // 3) SORTING
        //testing consoling
        // console.log(`this.queryString.sort ${this.queryString.sort}`);
        // console.log(this.queryString.sort);

        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');

            // TODO: ERROR IN SORTING ON 2 BASES
            // console.log(`sortBy ${sortBy}`);

            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');

            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;
